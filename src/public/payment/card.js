
const year = new Date().getFullYear()

const htmlFormCard = `
<style>
    #form-checkout {
        display: flex;
        flex-wrap: wrap;
        background-color: #e9e9e9;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        justify-content: space-between;
        gap: 28px;
        width: 450px;
        position:relative
    }
    #form-checkout select, #form-checkout input, #form-checkout .input {
        margin-bottom: 10px;
        padding: 5px;
        border-radius: 5px;
        border: 1px solid #ccc;
        width: 100%;
        max-width: 500px;
        background-color: white;
    }
    #form-checkout div button {
        padding: 10px;
        border: none;
        background-color: #007bff;
        color: white;
        cursor: pointer;
        width: 100%;
        max-width: 500px;
    }
    #form-checkout div button:hover {
        background-color: #0056b3;
    }
    #form-checkout h2 {
        margin-top: 20px;
    }
    #form-checkout label {
        margin-top: 10px;
    }
    #form-checkout select{
        width:100%;
        padding:5px;
        border-color:#ccc;    
    }
    div:has(> form#form-checkout) {
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 999;
    }
    .card{
        width:7cm;
        height:4cm;
        background-color:white
    }
    ul{
        list-style:none;
        display:flex;
    }

    .final  {
        width: 100%;
        background-color: var(--clr);
        width: 300px;
        height: 300px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 60px;
        flex-direction: column;
        margin: auto;
        animation: fadeIn .5s
    }

    .final i {
        color: white;
        animation: like 0.3s 1s
    }

    .final div {
        font-size: 30px;
        color: white;
        animation: text 0.3s 1s
    }

    @keyframes like {
        to {
            transform: skewY(10deg)
        }
    }

    @keyframes fadeIn {
        0% {
            width:0;
            height:0
        }

        100% {
            box-shadow: var(--clr) 0 0 15px 15px;

        }
    }

    @keyframes like {
        to {
            color:transparent
        }
    }

</style>
    <form id="form-checkout">
    <button class="close">x</button>
    <div style="width:100%">
        <h4>Cartões aceitos</h4>
        <ul id="list-cards"></ul>
        <h3>Dados do Cartão</h3>        
        <div id="form-checkout__cardNumber" class="container input" style="height:20px"></div>
        <div id="form-checkout__expirationDate" class="container input" style="height:20px"></div>
        <div id="form-checkout__securityCode" class="container input" style="height:20px"></div>
        <input type="text" id="form-checkout__cardholderName" />
        <select id="form-checkout__issuer"></select>
        <select id="form-checkout__installments"></select>
        <select id="form-checkout__identificationType"></select>
        <input type="text" id="form-checkout__identificationNumber" />
        <input type="email" id="form-checkout__cardholderEmail" />              
        <button type="submit" id="form-checkout__submit">Pagar</button>
        <progress value="0" class="progress-bar">Carregando...</progress>
       
    </form>
`

export const showFormCard = ({ preapproval_plan_id, user, amount }) => {
    if (!user) return
    const div = document.createElement('div')
    div.innerHTML = htmlFormCard
    document.body.appendChild(div)
    document.querySelector('#form-checkout .close').addEventListener('click', async (e) => {
        e.preventDefault()
        hideFormCard()        
    })


    fetch('/payment-method')
        .then(response => response.json())
        .then(data => {
            const listCards = document.querySelector('#list-cards')
            data.filter(({ status, payment_type_id }) => status === 'active' && payment_type_id === 'credit_card').forEach(card => {
                const li = document.createElement('li')
                const img = document.createElement('img')
                img.src = card.thumbnail
                img.style.width = '30px'
                img.style.height = '20px'
                img.style.backgroundColor = 'white'
                img.style.marginRight = '10px'
                img.style.borderRadius = '5px'
                img.style.padding = '5px'
                img.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.1)'
                img.title = card.name
                li.appendChild(img)
                listCards.appendChild(li)
            })
        })

    const public_key = 'APP_USR-5a223744-b141-4e8d-a2d5-9405d29d6766'
    const mp = new MercadoPago(public_key, { locale: 'pt-BR' })

    const cardForm = mp.cardForm({
        amount,
        iframe: true,
        form: {
            id: "form-checkout",
            cardNumber: {
                id: "form-checkout__cardNumber",
                placeholder: "Número do cartão",
            },
            expirationDate: {
                id: "form-checkout__expirationDate",
                placeholder: "MM/YY",
            },
            securityCode: {
                id: "form-checkout__securityCode",
                placeholder: "Código de segurança",
            },
            cardholderName: {
                id: "form-checkout__cardholderName",
                placeholder: "Titular do cartão",
            },
            issuer: {
                id: "form-checkout__issuer",
                placeholder: "Banco emissor",
            },
            installments: {
                id: "form-checkout__installments",
                placeholder: "Parcelas",
            },
            identificationType: {
                id: "form-checkout__identificationType",
                placeholder: "Tipo de documento",
            },
            identificationNumber: {
                id: "form-checkout__identificationNumber",
                placeholder: "Número do documento",
            },
            cardholderEmail: {
                id: "form-checkout__cardholderEmail",
                placeholder: "E-mail",
            },
        },
        callbacks: {
            onFormMounted: error => {
                console.log("Form mounted", error);
                if (error) return console.warn("Form Mounted handling error: ", error);
                console.log("Form mounted");
            },
            onSubmit: async event => {
                event.preventDefault();

                const { token: card_token_id, cardholderEmail: payer_email} = cardForm.getCardFormData()

                const response = await fetch("/createSubscription", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        card_token_id,
                        preapproval_plan_id,
                        payer_email,
                        payer_id: user.id
                    }),
                });
                const payed = (await response.json()).id
                const div = document.querySelector('#form-checkout>div')
                
                const direction = payed ? 'up' : 'down'
                const color = payed ? 'green' : 'red'
                const text = payed ? 'Sucesso...' : 'Erro...'
                div.innerHTML = `
                <div class="final" style="--clr:${color}">
                    <i class="fa-solid fa-thumbs-${direction}"></i>
                    <div>${text}</div>
                </div>
                `

            },
            onFetching: (resource) => {
                console.log("Fetching resource: ", resource);

                // Animate progress bar
                const progressBar = document.querySelector(".progress-bar");
                progressBar.removeAttribute("value");

                return () => {
                    console.log("Finished fetching resource", resource);
                    progressBar.setAttribute("value", "0");
                };
            }
        },
    });

}
export const showFormCard_link = ({ preapproval_plan_id, user, amount }) => {

    const div = document.createElement('div')
    div.style.position = 'fixed'
    div.style.top = '25px'
    div.style.left = '50%'
    div.style.transform = 'translateX(-50%)'
    div.style.width = '90vw'
    div.style.height = '90dvh'
    div.innerHTML = `<iframe style="width:100%; height:100%" src="https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=${preapproval_plan_id}" title="Pagina de pagamento"></iframe>`
    document.body.appendChild(div)
}
const hideFormCard = () => {
    document.querySelector('div:has(> form#form-checkout)').remove()
}




