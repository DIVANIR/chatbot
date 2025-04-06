import { showFormCard } from "../payment/card.js"

export const showPlans = async (user) => {
    const content = document.createElement('div')
    content.id = 'modal'
    content.style.position = 'fixed'
    content.style.zIndex = 10
    content.style.top = 0
    content.style.left = 0
    content.style.bottom = 0
    content.style.right = 0
    content.style.display = 'flex'
    content.style.justifyContent = 'center'
    content.style.alignItems = 'center'

    content.innerHTML = '<div class="loading"></div>'

    const response = await fetch('/payment-plans')
    const results = await response.json()


    const htmlPlans = `
    <div style="background-color: var(--background-color); padding: 12px; border-radius:8px;position:relative">
        <button class="close" data-close_modal="">x</button>
        <h1 style="text-align:center">Escolha o Plano Ideal para Sua Empresa</h1>
        <div class="cards">
            <div class="plan-card">
                <h2>Gratuito</h2>
                <p style="font-size:12px"><strong style="font-size:30px; color:var(--primary-color)">${new Intl.NumberFormat('pt-BR', { currency: 'BRL', style: 'currency' }).format(0)}</strong> por mês</p>
                <p>30 atendimentos sem cobrança</p>
                <ul>
                    <li>30 atendimentos</li>
                </ul>
                <button>Assinar</button>
            </div>
            ${results.map(item => `
                    <div class="plan-card">
                        <h2>${item.name}</h2>
                        <p style="font-size:12px"><strong style="font-size:30px; color:var(--primary-color)">${new Intl.NumberFormat('pt-BR', { currency: 'BRL', style: 'currency' }).format(item.value)}</strong> por mês</p>
                        <p>Até ${item.limit ?? 10} atendimentos ao mês</p>
                        <ul>
                            <li>${item.auto_recurring}</li>
                        </ul>
                        <button data-set_plan='${JSON.stringify({ user, preapproval_plan_id: item.id, amount: item.value.toString() })}' class="primary">Assinar</button>
                    </div>
                `)
        }
            
        </div >
    </div >
    `
    content.onclick = onclick
    document.body.appendChild(content)

    setTimeout(() => content.innerHTML = htmlPlans)



}

const setPlan = (item) => {
    closeModal()
    showFormCard({...JSON.parse(item)})
}

const closeModal = () => document.querySelector('#modal').remove()

const onclick = ({ target }) => {
    const fnc = {
        setPlan, closeModal
    }

    const dataset = target.dataset
    const [key, value] = Object.entries(dataset)[0]
    const fncName = key.split('_').map((word, index) => index > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word).join('')
    const functionByName = fnc[fncName]
    functionByName(value || target)

}