interface GenericState<U> {
    [key:string]:U
}

let state: GenericState<any> = {}

export default function getStates() {

    const get = <T>(key: string, defaultValue:T) : T => {
        return state[key] ?? defaultValue
    }

    const set = <T>(key: string, value: T) => {
        state[key] = value
    }

    const remove = (key: string) => {
        delete state[key]
    }

    return { get, set, remove }
}