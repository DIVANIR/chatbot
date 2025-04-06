import getAuth from "../firebase/auth.js"
import { ShowMessage } from "../showMessage.js"
import { showPlans } from "../plans/index.js"

const listProducts = document.querySelector('.list-products ul')

const init = (user) => {
    document.querySelector('#profile-name').textContent = user.name
    document.querySelector('#profile-pic').src = user.photo || 'https://ui-avatars.com/api/?name=' + user.name

    let sessionName = user.id

    const statusZapElement = document.querySelector('#status-zap')
    const connectZap = document.querySelector('#connect-zap')
    const base64QrimgElement = document.querySelector('#base64Qrimg')

    const statusClasses = {
        'Pedido confirmado': '',
        'Em preparação': 'in-progress',
        'Saiu para entrega': 'out-for-delivery',
        'Entregue': 'delivered',
        'Cancelado': 'canceled'
    }

    connectZap.addEventListener('click', () => {
        const store = JSON.parse(localStorage.getItem('store') || '{}')
        if(!store.typeStore || !store.name || !store.products || !store.products.length){
            ShowMessage({
                text: 'Preencha os dados da sua loja e adicione produtos para continuar',
                type: 'warn'
            })
            showSetting()
            return
        }
        statusZapElement.className = 'initBrowser'
        socket.emit('toConnect', {store, sessionName})
    })

    const socket = io()

    socket.on('connect', () => {
        console.log(socket.id)
        socket.emit('sessionName', { sessionName })
    })

    socket.on('disconnect', () => {
        statusZapElement.className = 'less-server'
    })

    socket.on('status', data => {
        const status = data?.statusSession ?? 'nothing'
        statusZapElement.className = status
        const sucessList = [
            'noOpenBrowser',
            'isLogged',
            'browserClose',
            'qrReadSuccess',
            'qrReadFail',
            'autocloseCalled',
            'chatsAvailable',
            'erroPageWhatsapp',
            'waitForLogin',
            'waitChat',
            'successChat',
            'nothing'
        ]
        if (sucessList.includes(status)) {
            base64QrimgElement.src = ''
        }
    })
    socket.on('base64Qrimg', data => {
        base64QrimgElement.src = data.base64Qrimg
    })

    socket.on('orders', ({ orders, count, page }) => {

        if (!orders) return
        const pedidosOrdenados = Object.entries(orders)
            //.sort(([, a], [, b]) => new Date(b.dateTime._seconds * 1000) - new Date(a.dateTime._seconds * 1000))
            .map(([key, value]) => ({ code: key, ...value }))


        let rows = pedidosOrdenados.length ? '' : `<td colspan="8">
            <div style="display: flex; width: 100%; justify-content: center;">Os pedidos aparecerão aqui...
            </div>
        </td>`
        for (const order of pedidosOrdenados) {
            rows += `<tr class='${statusClasses[order.status]}'>
                <td>${order.code}</td>
                <td>${new Date(order.dateTime).toLocaleString()}</td>
                <td>${order.client.name}<br/>${order.client.address}<br/>${order.client.phone}</td>
                <td>
                    <table class='items'>
                        ${order.items.map(item =>
                `<tr>
                                <td>${item.quantities} -</td>
                                <td>${item.description} ${(item.quantities > 1 ? `${item.quantities} X ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unitValue)}` : '')}</td>
                                <td>${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.quantities * item.unitValue)}</td>
                            </tr>`
            ).join('')}
                    </table></br>
                    ${order.observation ? `<b>Observação:</b> ${order.observation}` : ''}
                </td>
                <td>R$ ${order.totalAmount.toFixed(2)}</td>
                <td class="status">
                    <select>
                        <option >Pedido confirmado</option>
                        <option ${statusClasses[order.status] === 'in-progress' ? 'selected' : ''} class="in-progress" value="in-progress">Em preparação</option>
                        <option ${statusClasses[order.status] === 'out-for-delivery' ? 'selected' : ''} class="out-for-delivery" value="out-for-delivery">Saiu para entrega</option>
                        <option ${statusClasses[order.status] === 'delivered' ? 'selected' : ''} class="delivered" value="delivered">Entregue</option>
                        <option ${statusClasses[order.status] === 'canceled' ? 'selected' : ''} class="canceled" value="canceled">Cancelado</option>
                    </select>
                </td>
                <td>
                    ${
                        order.paymentMethod
                    }
                </td>
                <td>
                    <img src="../img/print.webp" alt="Imprimir" width="30" style="cursor:pointer"/>
                </td>
            </tr>
            `
        }

        document.querySelector('tbody').innerHTML = rows
        document.querySelectorAll(".status select").forEach(select => select.addEventListener("change", ({ target }) => {
            const rowElement = target.closest('tr')
            const codeElement = rowElement.querySelector('td:first-child')
            //const statusElement = rowElement.querySelector('.status > span')

            const newStatus = target.querySelector(`[value="${target.value}"]`).textContent
            const code = codeElement.textContent
            const properties = { status: newStatus }

            rowElement.className = target.value
            //statusElement.textContent = newStatus
            console.log({ order: { code, ...properties }, session: sessionName })
            socket.emit('save-order', { order: { code, ...properties }, session: sessionName })
        }))
        console.log({
            count, page
        })
        document.querySelector('tfoot td    ').innerHTML = `
            <div style="width:100%; display:flex; justify-content:center">
                ${page > 1 ? `<button data-page="0">1</button> ... ` : ''}
                ${page > 0 ? `<button data-page="${page - 1}">${page}</button>` : ''}
                <button style="background-color:#9fd5f9; border-color:#109bf7">${page + 1}</button>
                ${page < count - 1 ? `<button data-page="${page + 1}">${page + 2}</button>` : ''}
                ${page < count - 2 ? ` ... <button data-page="${count - 1}">${count}</button>` : ''}
            </div>
        `

        document.querySelector('tfoot div').addEventListener('click', ({ target }) => {
            if (target.tagName === 'BUTTON' && !isNaN(target.dataset.page)) {
                socket.emit('page', target.dataset.page * 1)
            }
        })
    })

    function speakNotification(message = "Novo pedido disponível!") {
        const speech = new SpeechSynthesisUtterance(message);
        speech.lang = "pt-BR";
        speech.rate = 1;
        speech.pitch = 1.2;
        speech.volume = 1;

        function setVoice() {
            const voices = speechSynthesis.getVoices();

            const femaleVoice = voices.find(voice =>
                voice.lang.includes("pt-BR") &&
                (voice.name.includes("Google") || voice.name.includes("Microsoft")) &&
                voice.name.toLowerCase().includes("female")
            );

            speech.voice = femaleVoice || voices.find(voice => voice.lang.includes("pt-BR")) || voices[0];

            window.speechSynthesis.speak(speech);
        }

        if (speechSynthesis.getVoices().length === 0) {
            speechSynthesis.onvoiceschanged = setVoice;
        } else {
            setVoice();
        }
    }

    document.querySelector('#signout').addEventListener('click', auth.signOut)

    document.querySelector('#save-setting').addEventListener('click', () => {
        const cnpj = document.querySelector('#cgc').value
        const name = document.querySelector('#company-name').value
        const address = document.querySelector('#company-address').value
        const methodPayments = [...document.querySelectorAll('[id*="company-payment-method-"]:checked ~ label')].map(({ textContent }) => textContent)
        const pixKey = document.querySelector('#key-pix').value
        const estimatedTimeDelivery = document.querySelector('#estimated-time').value
        const deliveryFee = document.querySelector('#delivery-fee').value
        const typeStore = document.querySelector('#typeStore').value
        if (!name) {
            ShowMessage({
                text: 'Preencha o nome da sua loja',
                type: 'error'
            })
            return
        }
        if (!pixKey && methodPayments.includes('Pix')) {
            ShowMessage({
                text: 'Informe a chave pix, ela será enviado para o cliente caso ele queira pagar com pix',
                timeout: 8000,
            })
        }
        const store = {
            name,
            cnpj,
            address,
            methodPayments,
            pixKey,
            deliveryFee,
            estimatedTimeDelivery,
            typeStore
        }
        socket.emit('store', store)
        document.querySelector('.modal-setting').style.display = 'none'
        localStorage.setItem('store', JSON.stringify(store))
    })

    document.querySelector('#setting').addEventListener('click', showSetting)

    document.querySelector('#add-product-in-list').addEventListener('click', () => {
        addItemInStore(socket)
    })

    const removeItemInStore = (index) => {
        const store = JSON.parse(localStorage.getItem('store'))
        store.products.splice(index,1)
        localStorage.setItem('store', JSON.stringify(store))
        socket.emit('store', store)
        renderProducts(store.products)
    }
    
    listProducts.addEventListener('click', ({target}) => {
        if(target.tagName === 'BUTTON'){
            removeItemInStore(target.dataset.index)
        }
    })
    
}
const auth = getAuth()


    auth.getUser()
    .then(user => {
        if (user) {
            readStore(user)
            init(user)
            //showPlans(user)

            fetch('/subscriptions/'+user.id)
        }
    })

document.querySelector('#cgc').addEventListener('input', async ({ target }) => {
    const cnpj = target.value.replace(/[^0-9]/g, '')
    if (cnpj.length === 14) {
        const response = await fetch('https://brasilapi.com.br/api/cnpj/v1/' + cnpj)
        const result = await response.json()
        const { descricao_tipo_de_logradouro, nome_fantasia, razao_social, logradouro, numero, bairro, municipio, uf } = result
        document.querySelector('#company-name').value = nome_fantasia || razao_social
        document.querySelector('#company-address').value = `${descricao_tipo_de_logradouro} ${logradouro} ${numero}, BAIRRO ${bairro}, ${municipio}-${uf}`

    }
})

const showSetting = () => document.querySelector('.modal-setting').style.display = 'flex'


const readStore = async (user) => {
    const store = JSON.parse(localStorage.getItem('store'))
    if (store) {
        fullSetting(store)
        return
    }

    const response = await fetch('/store/'+user.id)
    const storeData = await response.json()
    if (storeData) {
        fullSetting(storeData)
        localStorage.setItem('store', JSON.stringify(storeData))
        return
    }
    showSetting()
}

const fullSetting = (store) => {
    document.querySelector('#cgc').value = store.cnpj
    document.querySelector('#company-name').value = store.name
    document.querySelector('#company-address').value = store.address
    document.querySelector('#typeStore').value = store.typeStore
    store.methodPayments.forEach(method => {
        document.querySelector(`#company-payment-method-${method.toLowerCase().replace('/','_')}`).checked = true
    })
    document.querySelector('#key-pix').value = store.pixKey
    renderProducts(store.products)
}


document.querySelector('#add-product').addEventListener('click', (event) => {
    const listProducts = document.querySelector('.list-products')
    listProducts.style.setProperty('display','block')
    listProducts.style.setProperty('--top',event.clientY+'px')
    listProducts.style.setProperty('--left',event.clientX+'px')
})



const addItemInStore = (socket) => {
    const product = {
        description: document.querySelector('#product-description').value,
        price: document.querySelector('#product-price').value,
        name: document.querySelector('#product-name').value
    }
    if(!product.price || !product.name){
        ShowMessage({
            text: 'Os campos nome e preço são obrigatórios',
            type: 'error'
        })
        return
    }
    if(!product.price.match(/^\d+\.?\d{0,2}$/)){
        ShowMessage({
            text: 'O preço deve ser um número válido',
            type: 'error'
        })
        return
    }
    const store = JSON.parse(localStorage.getItem('store'))
    store.products = store.products || []
    store.products.push(product)
    localStorage.setItem('store', JSON.stringify(store))
    socket.emit('store', store)
    renderProducts(store.products)
}



const renderProducts = (products) => {
    
    listProducts.innerHTML = ''
    products.forEach(product => {
        const li = document.createElement('li')
        li.innerHTML = `
            <span>${product.name}</span>            
            <span style="float:right">${new Intl.NumberFormat('pt-BR',{currency:'BRL', style:'currency'}).format(product.price)}<button data-index=" ${products.indexOf(product)}" style="background:crimson">X</button></span>
            <br>
            <span style="opacity:.8">${product.description}</span>
            <hr>
        `
        listProducts.prepend(li)
    })
}

