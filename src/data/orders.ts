
import { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore'
import { db } from '../firebase'
import getStates from './states'
import { notifyObservers } from '../utils/observers'
import { FieldValue, count, getCountFromServer, serverTimestamp } from 'firebase/firestore'

type Status = 'Pedido confirmado'
    | 'Em preparação'
    | 'Saiu para entrega'
    | 'Entregue'
    | 'Cancelado'
    | 'Iniciado'

export interface IOrder {
    code: string,
    dateTime: FieldValue | number,
    client: { name: string, phone: string, address: string }
    items: {
        quantities: number,
        description: string,
        unitValue: number
    }[],
    totalAmount: number,
    status: Status
    observation?: string,
    paymentMethod: string
}

type stateProps = { orders: IOrder[], lastDoc?: QueryDocumentSnapshot, currentPage: number, count: number }

export type PropsSaveOrder = {
    order:IOrder,
    session: string,
    isUpdate : boolean
}

const ordersRef = (session: string) => db.collection(session).doc('orders').collection('list')

export const save_order = async ({order, session, isUpdate}:PropsSaveOrder) => {

    const state = getStates()
                
    const doc = ordersRef(session).doc(order.code)
    const { orders, currentPage, lastDoc } = state.get<stateProps>(session, { currentPage: 0, orders: [], count: 0 })

    if (isUpdate) {
        notifyObservers()
        const index = orders.findIndex(o => o.code === order.code)
        orders[index] = {
            ...orders[index],
            ...order
        }
        state.set(session, { currentPage, lastDoc, orders })
        await doc.update({ ...order })
        return 'Dados alterados com sucesso'
    }
    order.dateTime = new Date().getTime()
    orders.unshift(order)

    state.set(session, { orders, lastDoc, currentPage })
    await doc.set({ ...order })
    notifyObservers()
    return 'Dados gravados com sucesso'
}

export const myOrders = async (session: string, page = 0, limit = 10) => {
    const state = getStates()
    const { orders: cacheOrders, currentPage, lastDoc, count } = state.get<stateProps>(session, { currentPage: page, orders: [], count: 0 })

    if (cacheOrders.length && page === currentPage) {
        return { orders: cacheOrders, count, page }
    }
    
    const docRef = ordersRef(session).orderBy('dateTime', 'desc')
    const doc = page > 0 ? await docRef.startAfter(lastDoc).limit(limit).get() : await docRef.limit(limit).get()

    const orders = doc.docs.map(doc => doc.data() as IOrder)

    const countSnapshot = await ordersRef(session).count().get();
    const total = countSnapshot.data().count;


    state.set(session, {
        orders,
        currentPage: page,
        lastDoc: doc.docs[doc.docs.length - 1],
        count: Math.ceil(total / limit) + 1,

    })
    return { orders, count: Math.ceil(total / limit) + 1, page }
}

export const allOrders = async (session: string) => {
    //return (await db.collection('db').where('#sk-15', '==', 'client').get())
}

