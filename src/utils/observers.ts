const observers : Array<() =>void>  = []


export function addObserver(observer:() => void) {
  observers.push(observer)
  //console.log({add:observers})
}

export function notifyObservers() {
  observers.forEach(observer => observer())
}

export function removeObserver(observer:() => void) {
  observers.splice(observers.indexOf(observer), 1)
  //console.log({remove:observers})
}

