import { NextFunction, Router } from 'express';
import fs from 'fs'
import mp from '../../mercadoPago';
import { db } from '../../firebase';


const SECRET_KEY = '#djs_assistant#'
const TOKEN_EXPIRE_IN_SECONDS = 60 * 30
const saltRounds = 10


const route = Router()
const mercadoPago = mp()


route.get('/payment-plans', async (req, res) => {
    res.json(await mercadoPago.getPlans())
})

route.get('/payment-method', async  (_, res) => {    
    res.json(await mercadoPago.getPaymentMethods())
})

route.get('/subscriptions/:payer_id', async (req,res) => {
    const {payer_id} = req.params
    console.log(payer_id)
    res.json(await mercadoPago.getSubscriptions(payer_id))
})

route.post('/createSubscription', async  (req, res) => {    
    res.json(await mercadoPago.createSubscription(req.body))
})

route.get('/store/:session', async (req, res) => {
    const {session} = req.params
    const data = await db.collection(session).doc('store').get()
    
    const store = data.data()
    console.log(store)
    res.json(store)
})

route.get('/invoice/:id', async (req,res) => {
    const {id} = req.params
    const invoices = await mercadoPago.getInvoice(id)
    res.json(invoices)
})

export {route }