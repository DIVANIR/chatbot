import express from 'express'
import { route } from './routes'
import http from 'http'
import { Server, Socket } from 'socket.io'
import { Chat } from '../ChatVenom'
import { IOrder, allOrders, myOrders, save_order } from '../data/orders'
import { addObserver, removeObserver } from '../utils/observers'
import { Whatsapp } from 'venom-bot'
import { save_store } from '../data/store'

const app = express()
const server = http.createServer(app)
const io = new Server(server)
app.use(express.json())
app.use(route)
app.use(express.static("src/public"))
const status: { [key: string]: {} } = {}

export type Store = {
    name: string,
    typeStore: string,
    products:{ name: string, description?: string, value: number}[]
    address: string
    deliveryFee: number
    methodPayment: string[]
    pixKey: string
}

const sessions = new Map<string, { sessionName: string, store:Store, chat?: Whatsapp}>()



io.on("connection", client => {
    client.on("toConnect", async ({store, sessionName}:{store:Store, sessionName:string}) => {
        sessions.set(client.id, { sessionName, store})
        
        const chat = await Chat(sessionName, store, (statusSession: string, session: string, info?: string) => {
            status[session] = { statusSession, info }
            client.emit("status", status[session])

        }, (base64Qrimg: string) => {
            client.emit("base64Qrimg", { base64Qrimg })
        })
        sessions.set(client.id, { sessionName, store, chat })
    })

    client.on('toDisconnect', async () => {
        const { chat } = sessions.get(client.id)!
        if(chat){
            chat.logout()
        }
    })

    client.on("sessionName", async ({sessionName, storeName}:{sessionName: string, storeName: string}) => {
        console.log('adding observer')
        client.emit("status", status[sessionName])

        const orders = await myOrders(sessionName)
        client.emit('orders', orders)
        addObserver(async () => {
            client.emit('orders', await myOrders(sessionName))
        })
        try {
            // const response = await fetch('https://api.mercadopago.com/preapproval/search')
            // const data = await response.json()
        } catch (error) {
            console.log(error)
        }
    })

    client.on("save-order", ({ order }: { order: IOrder }) => {
        const { sessionName: session } = sessions.get(client.id)!
        save_order({order, session, isUpdate:true})
    })

    client.on('disconnect', () => {
        try {
            
            const { sessionName: session } = sessions.get(client.id)!
            sessions.delete(session)
            removeObserver(() => {
                client.emit('orders', {})
            })
        } catch (error) {
            
        }
    })

    client.on('page', async page  => {
        const { sessionName } = sessions.get(client.id)!
        client.emit('orders', await myOrders(sessionName, page))
    })

    client.on('store', store => {
        const { sessionName: session } = sessions.get(client.id)!
        save_store({store, session })
    })

})
export { server }