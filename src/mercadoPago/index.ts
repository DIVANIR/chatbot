import { db } from "../firebase";

type propSubscription = {
    payer_email: string,
    card_token_id: string,
    preapproval_plan_id: string,
    payer_id: string
    identificationType: string,
    identificationNumber: string
}

type subscriptionType = {
    id: string,
    reason: string,
    next_payment_date: Date,
    last_charged_date: Date,
    status: string,
    transaction_amount: number;
    date_created: Date,
    external_reference: string
}

type typePlans = {
    results: [{
        reason: string, auto_recurring: {
            frequency: number,
            frequency_type: string
            transaction_amount: number
        },
        id: string,
        external_reference: string
    }]
}

const BASE_URL = 'https://api.mercadopago.com/';
const ACCESS_TOKEN = process.env.ACCESS_TOKEN_MERCADO_PAGO

const fetcher = async <T>(url: string, options: RequestInit = {}) : Promise<[Error | null, T]> => {
    options.headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`
    }
    try {
        const response = await fetch(url, options)
        const result = await response.json() as T
        return [null, result]        
    } catch (error) {
        return [error as Error, {} as T]
    }
}

const mp = () => {
    // 1 Obter Métodos de Pagamento
    async function getPaymentMethods() {
        const [error, data] = await fetcher(BASE_URL + 'v1/payment_methods', {})
        if (error) {
            return error
        }
        return data

    }

    // 3️ Criar Assinatura para um Cliente   
    async function createSubscription(props: propSubscription) {
        const { payer_email, card_token_id, preapproval_plan_id, payer_id } = props
        const [error, subscription] = await fetcher<{id:string}>(`${BASE_URL}preapproval`, {
            method: 'POST',
            body: JSON.stringify({
                preapproval_plan_id,
                external_reference: payer_id,
                payer_email,
                card_token_id,
                back_url: 'http://localhost:3000/',
            })
        })
        if(error){
            return error
        }
        try {
            if (subscription.id) {
                db.collection('db').doc(payer_id).collection('subscriptions').add({ ...subscription })
            } else {
                console.dir({ payer_id, subscription })
                db.collection('db').doc(payer_id).collection('subscription_erros').add({ ...subscription })
            }            
        } catch (error) {
            console.log({ error })
        }
        return subscription
    }

    const getPlans = async () => {
        const [error, plans] = await fetcher<typePlans>(`${BASE_URL}preapproval_plan/search`)
        return plans.results.filter(({ external_reference }) => external_reference?.includes('WhatsBotRobot')).map(plan => {
            return {
                name: plan.reason,
                auto_recurring: 'Pagamento mensal',
                id: plan.id,
                value: plan.auto_recurring.transaction_amount,
                limit: plan.external_reference.split('_')[1]
            }
        })
    }

    const getInvoice = async (id:string) => {
        const [error, invoices] = await fetcher(`${BASE_URL}v1/customers/search`)
        return invoices//.results.filter(({ external_reference }) => external_reference?.includes('WhatsBotRobot')).map(plan => {
            // return {
            //     name: plan.reason,
            //     auto_recurring: 'Pagamento mensal',
            //     id: plan.id,
            //     value: plan.auto_recurring.transaction_amount,
            //     limit: plan.external_reference.split('_')[1]
            // }
        //})
    }

    const getSubscriptions = async (payer_id: string) => {
        
        const [error, subscriptions] = await fetcher<subscriptionType[]>(BASE_URL + 'preapproval/search?limit=20')
        if(error){
            return error
        }
        return subscriptions/*.filter(({ external_reference }) => external_reference === payer_id)/*.map(({ id, reason, next_payment_date, last_charged_date, status, transaction_amount, date_created }) => {
            return { id, next_payment_date, last_charged_date, status, transaction_amount, date_created, reason }
        })*/
    }

    return {
        getPaymentMethods,
        createSubscription,
        getPlans,
        getSubscriptions,
        getInvoice
    }
}
// Chamando as funções
export default mp



