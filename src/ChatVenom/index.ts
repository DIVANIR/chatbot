import { CatchQR, create, Message, StatusFind, Whatsapp } from 'venom-bot'
import { typeMessages, CreateChatWithIA } from '../openai/index.js';
import { save_order } from '../data/orders.js';
import { Store } from '../server/server.js';


const usersMessages: {
    [key: string]: {
        messages: { [key: string]: CreateChatWithIA }
    }
} = {
    // 'jOAMaPPErwQeBv4KDR6IxXqbtj93': {
    //     messages: {
    //         //'553197304304@c.us': [
    //             // { role: "developer", content: promptDeveloper },
    //             // { role: "user", content: "Bom dia, o que tem de promoção para hoje?" },
    //             // { role: "assistant", content: "Bom dia! Agradeço por entrar em contato com a Pizzaria. No momento, não temos promoções específicas, mas podemos oferecer deliciosas opções do nosso cardápio. Posso ajudar com um pedido? Se sim, por favor, me diga seu nome para que eu possa registrar." },
    //             // { role: "user", content: "me sugere o melhor pedido" },
    //             // { role: "assistant", content: "Claro! Para um pedido saboroso, eu sugiro o seguinte:\n\n1. Uma pizza grande de Muçarela, que é clássica e agrada a muitos: R$ 35,00.\n2. Uma pizza média de Frango com Catupiri, que é bem recheada e deliciosa: R$ 40,00.\n3. Para a sobremesa, uma pizza doce de Chocolate, que também é bem popular: R$ 40,00.\n\nVocê gostaria de adicionar algo mais, como bebidas ou bordas recheadas? Posso ajudar a confirmar seu pedido! Ah, e se você puder, me diga seu nome para registro." },
    //             // { role: "user", content: "òtimo, quero tudo isso ai e mais uma garrafa de pinga, quando vai dar tudo" },
    //             // { role: "assistant", content: "Que bom que gostou das sugestões! Porém, infelizmente, não temos bebidas alcoólicas no nosso cardápio. Posso oferecer algumas opções de refrigerantes ou água?\n\nAqui está o resumo do seu pedido até agora:\n\n- **1 Pizza Grande de Muçarela:** R$ 35,00\n- **1 Pizza Média de Frango com Catupiri:** R$ 40,00\n- **1 Pizza Grande de Chocolate:** R$ 40,00\n- **Bebida:** (preciso da sua escolha)\n\nTotal até agora (sem a bebida): R$ 115,00.\n\nPor favor, me avise qual bebida você gostaria, e também, não esqueça de me informar seu nome e seu endereço, caso seja entrega." },
    //             // { role: "user", content: "Entendi, mas infelizmente nao tenho dinheiro, mas estou com fome" },
    //             // { role: "assistant", content: "Entendo que está com fome, e faremos o possível para ajudá-lo! Temos opções de pagamento além do dinheiro, como PIX e cartão de crédito ou débito na entrega. Você gostaria de utilizar uma dessas formas de pagamento?\n\nAlém disso, ainda preciso do seu nome e, se for entrega, o seu endereço (Rua, Número, Bairro) para que possamos prosseguir com o pedido. Fico à disposição para ajudar!" },
    //             // { role: "user", content: "Então manda para rua das castanheiras em diamantina minas gerais, mas nao vou pagar" },
    //             // { role: "assistant", content: "Para confirmar seu pedido, preciso que você informe o seu nome para registro e uma forma de pagamento. A entrega tem uma taxa de R$ 5,00, então precisamos garantir que o pagamento seja realizado.\n\nSe não puder efetuar o pagamento, infelizmente não conseguirei processar o pedido. Mas estou aqui para ajudar com qualquer outra dúvida ou informação que você precise!" },
    //             // { role: "user", content: "Ta bão, me chamo João do Pulo e vou pagar no credito" },
    //             // { role: "assistant", content: "Ótimo, João do Pulo! Vamos finalizar o seu pedido. Aqui está o resumo até agora:\n\n- **1 Pizza Grande de Muçarela:** R$ 35,00\n- **1 Pizza Média de Frango com Catupiri:** R$ 40,00\n- **1 Pizza Grande de Chocolate:** R$ 40,00\n- **Bebida:** (preciso da sua escolha)\n\n**Taxa de entrega:** R$ 5,00\n\nTotal até agora (sem a bebida): R$ 115,00.\n\nAgora, por favor, me diga qual bebida você gostaria adicionar ao seu pedido. As opções são:\n\n- Coca-Cola 2L: R$ 10,00\n- Coca-Cola Lata: R$ 8,00\n- Guaraná 2L: R$ 10,00\n- Guaraná Lata: R$ 7,00\n- Água com Gás 500 ml: R$ 5,00\n- Água sem Gás 500 ml: R$ 4,00\n\nAssim que eu tiver essa informação, poderei confirmar seu pedido e informar o valor total." },
    //             // { role: "user", content: "Um cafe sem açúcar ou uma coca" },
    //             // { role: "assistant", content: "No nosso cardápio, temos as opções de bebidas que mencionei anteriormente, mas café não está disponível. \n\nSe você gostaria de adicionar uma Coca-Cola, aqui está o resumo atualizado do seu pedido com a Coca-Cola Lata:\n\n- **1 Pizza Grande de Muçarela:** R$ 35,00\n- **1 Pizza Média de Frango com Catupiri:** R$ 40,00\n- **1 Pizza Grande de Chocolate:** R$ 40,00\n- **1 Coca-Cola Lata:** R$ 8,00\n\n**Taxa de entrega:** R$ 5,00\n\n**Total:** R$ 128,00.\n\nPor favor, confirme se está tudo certo e também me informe o número exato da sua casa para a entrega em Rua das Castanheiras, Diamantina, Minas Gerais. Assim que tivermos todos os detalhes, poderei finalizar o pedido e fornecer o código!" },
    //             // { role: "user", content: "Pode finalizar o pedido" },
    //             // { role: "assistant", content: "Perfeito, João do Pulo! Só preciso que você me informe o número exato da sua residência na Rua das Castanheiras, Diamantina, Minas Gerais, para que eu possa concluir o pedido.\n\nAqui está o resumo final até agora:\n\n- **1 Pizza Grande de Muçarela:** R$ 35,00\n- **1 Pizza Média de Frango com Catupiri:** R$ 40,00\n- **1 Pizza Grande de Chocolate:** R$ 40,00\n- **1 Coca-Cola Lata:** R$ 8,00\n\n**Taxa de entrega:** R$ 5,00\n\n**Total:** R$ 128,00.\n\nAguardo o número da sua casa para finalizar e gerar o código do pedido!" },

    //        // ]
    //     }
    // }
}


const Chat = async (session: string, store: Store, statusFind?: StatusFind, catchQR?: CatchQR) => {
    const client = await create({ session, statusFind, catchQR, browserArgs: ['--headless=new'] })

    /*setInterval(()=>{
        client.sendText('553197304304@c.us',"Oi")
    },30000)*/

    start(client, session, store)
    
    return client
}

const start = async (client: Whatsapp, session: string, store: Store) => {
    const toRespond = async (message: Message) => {
        if (message.body && !message.isGroupMsg && message.from !== "status@broadcast") {
            if (message.type !== "chat") {
                return await client.sendText(message.from, "Desculpe! Eu sou um atendente virtual, então eu só posso ler mensagem de texto no momento")
            }
            try {
                if (!usersMessages[session]) {
                    usersMessages[session] = {
                        messages: {
                            [message.from]: new CreateChatWithIA({store,clientPhone: message.from, clientName:message.notifyName, session})
                        }
                    }
                }
                if (!usersMessages[session].messages[message.from]) {
                    usersMessages[session].messages[message.from] = new CreateChatWithIA({store,clientPhone: message.from, clientName:message.notifyName, session})
                }

                if(verifyIsBot(usersMessages[session].messages[message.from].getMessages())){
                    return
                }

                usersMessages[session].messages[message.from].addMessage({ role: 'user', content: message.body })

                const response = await usersMessages[session].messages[message.from].send_message_for_openai() as string
                usersMessages[session].messages[message.from].addMessage({ role: "assistant", content: response })

                await client.sendText(message.from, response)

                if (response.includes('#sk-')) {
                    // usersMessages[session].messages[message.from].push({
                    //     role: "user", content: `
                    //     Faça um json assim : {
                    //         code:contento id do pedido,
                    //         status: 'Pedido confirmado',
                    //         client:{
                    //             name: contendo o nome do cliente,
                    //             phone:'${message.from.replace('@c.us', '').substring(2)}'
                    //             address: contendo endereço completo do cliente
                    //         },
                    //         items:[
                    //             {
                    //                 "description": descrição de cada produto,
                    //                 "unitValue": 25.5 valor de cada produto,
                    //                 "quantities": 1 quantidade de cada produto
                    //             }
                    //             inclusive taxas
                    //         ],
                    //         totalAmount: o valor total das compras
                    //     } responda apenas com o json começando com { e terminando com }
                    // `})
                    // const obj = JSON.parse(await send_message_for_openai(usersMessages[session].messages[message.from]))
                    // obj.dateTime = new Date().getTime()
                    // //obj.client.phone = message.from.replace('@c.us', '').substring(2)
                    // save_order(obj, session)
                }

            } catch (error) {
                console.error('Error when sending: ', error)
            }
        }
    }

    client.onMessage((message) => {
        toRespond(message)
    });

    const messages = await client.getUnreadMessages()
    const unreadMessages = Object.values(messages.reduce((accumulate: { [key: string]: Message }, currentValue: Message) => {

        if (!accumulate[currentValue.from] && currentValue.body && currentValue.type === 'chat') {
            accumulate[currentValue.from] = currentValue
            return accumulate
        }
        if (currentValue.body && currentValue.type === 'chat') {
            accumulate[currentValue.from].body = accumulate[currentValue.from].body + currentValue.body + '\n'
        }
        return accumulate
    }, {})) as Message[]

    unreadMessages.forEach(toRespond)

}

const verifyIsBot = (messages: typeMessages[]) => {
    if (messages.length > 5 ) {
        //messages[0].
        return false
    }
    return false
}


export { Chat }

