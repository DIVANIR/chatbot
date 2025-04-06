import { save_order, PropsSaveOrder } from '../data/orders'
import { Store } from '../server/server'
import { Prompt } from './prompt'


const urlCompletions = 'https://api.openai.com/v1/chat/completions'
const { OPENAI_API_KEY } = process.env

export type typeMessages = {
    role: 'user' | 'assistant' | 'system' | 'tool',
    tool_call_id?: string,
    content: string
}

const options: RequestInit = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`
    }
}
type ToolCallFunctionName = 'store' | 'save_order'
type OpenAIResponse = {
    usage: {};
    choices: {
        message: {
            content: string;
            tool_calls?: {
                id: string;
                type: string;
                function: {
                    name: string;
                    arguments: string;
                };
            }[];
        };
    }[];
}

type PropsCreateChatWithIA = { store: Store, clientPhone: string, clientName: string, session: string }

class CreateChatWithIA {
    private session: string
    private messages: typeMessages[] = []
    private store: Store


    constructor({ store, clientPhone, clientName, session }: PropsCreateChatWithIA) {
        clientPhone = clientPhone.slice(2,-5)
        this.session = session
        this.store = store

        const prompt = new Prompt({
            clientName,
            storeName: store.name,
            clientPhone,
            typeStore: store.typeStore,
        }).getPrompt()

        this.messages.push({
            role: 'system',
            content: prompt
        })
    }

    addMessage = (message: typeMessages) => {
        this.messages.push(message)
    }

    send_message_for_openai = async (): Promise<string | undefined> => {
        options.body = JSON.stringify({
            model: 'gpt-4o-mini',
            messages: this.messages,
            store:true,
            tools: [
                {
                    type: 'function',
                    function: {
                        name: 'store',
                        description: 'Obter os produtos disponíveis disponível, endereço da loja, taxa de entrega e tempo de entrega, forma de pagamento)',
                        parameters: {
                            type: 'object',
                            properties: {
                                session: {
                                    type: 'string',
                                    description: this.session
                                }
                            },
                            required: ['session'],
                            additionalProperties: false
                        },
                        strict: true
                    }
                },
                {
                    type: 'function',
                    function: {
                        name: 'save_order',
                        description: 'Gravar o pedido no banco de dados firebase',
                        parameters: {
                            type: 'object',
                            properties: {
                                session: { type: 'string', description: this.session },
                                isUpdate: { type: 'boolean', description: 'Se for gravar novo registro é false, se for alterar registro é true' },
                                order: {
                                    type: 'object',
                                    properties: {
                                        code: {
                                            type: 'string',
                                        },
                                        client: {
                                            type: 'object',
                                            properties: {
                                                name: { type: 'string', description: 'Nome do cliente' },
                                                phone: { type: 'string', description: 'Telefone do cliente' },
                                                address: { type: 'string', description: 'Rua, Bairro , número e complemento, mas caso o cliente opte por buscar na loja envie uma string vazia' }
                                            },
                                            required: ['name', 'phone', 'address'],
                                            additionalProperties: false

                                        },
                                        items: {
                                            type: 'array',
                                            description: 'Incluir todos os produtos inclusive taxas caso tenha',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    description: { type: 'string', description: 'Descrição do produto' },
                                                    unitValue: { type: 'number', description: 'Valor unitário' },
                                                    quantities: { type: 'number', description: 'Quantidade' },
                                                },
                                                required: ['description', 'unitValue', 'quantities'],
                                                additionalProperties: false
                                            }
                                        },
                                        totalAmount: { type: 'number', description: 'Soma total de todos os produtos x quantidade, inclusive taxa caso tenha' },
                                        status: { type: 'string', description: 'Definir como Pedido Confirmado' },
                                        observation: { type: 'string', description:'Observações do pedido' },
                                        paymentMethod: { type: 'string', description: 'Forma de pagamento'}
                                    },
                                    required: ['code', 'status', 'client', 'items', 'totalAmount', 'observation', 'paymentMethod'],
                                    additionalProperties: false
                                },
                            },
                            required: ['session', 'order', 'isUpdate'],
                            additionalProperties: false
                        },
                        strict: true
                    },
                }
            ]
        })
        const response = await fetch(urlCompletions, options)
        const result = await response.json() as OpenAIResponse
        const { usage, choices } = result;
        debugger

        if (choices[0].message.tool_calls) {
            this.addMessage(choices[0].message as typeMessages)
            for (const toolCall of choices[0].message.tool_calls) {
                const args = JSON.parse(toolCall.function.arguments);
                const fnc = this.callFunctions[toolCall.function.name as ToolCallFunctionName]
                
                this.addMessage({
                    role: 'tool',
                    content: JSON.stringify(await fnc(args)),
                    tool_call_id: toolCall.id,
                });
            }
            return (await this.send_message_for_openai()) as string
        } else {
            return choices[0].message.content as string
        }
    }

    getMessages = () => this.messages

    callFunctions = {
        store: () => this.store,
        save_order,
        sendQrCode : async () => {
    
        }
    };
}


export { CreateChatWithIA }