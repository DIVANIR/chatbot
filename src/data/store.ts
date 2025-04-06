
import { db,  } from '../firebase'

export interface IStore {
    name: string
    cnpj: string
    address: string
    pixKey: string
    methodPayments: string[]
}

export type PropsSaveStore = {
    store: IStore
    session: string
    id?:string
}

export const save_store = async ({ store, session, id}: PropsSaveStore) => {
    const doc = db.collection(session).doc('store')//.collection('store').doc('data-store')
    await doc.set({...store}, {merge: true})
    return 'Dados gravados com sucesso'
}

// export const myStore = async (session: string) => {
    
//     const storeRef = db.collection(session).doc('store')    
//     const doc = await storeRef.get()
//     const store = doc.docs.map(doc => doc.data() as IStore)[0]

//     return { store }
// }


