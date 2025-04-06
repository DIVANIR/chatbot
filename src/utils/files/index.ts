import fs from 'fs'

export const readFile = (path:string) =>{
    console.log({read:path})
    return JSON.parse(fs.readFileSync(path,{ encoding: 'utf8', flag: 'r' }) || '{}')
} 

export const writeFile = (path:string, data:string) => {
    console.log({write:path})
    return fs.writeFileSync(path, data,{encoding:"utf8"})
}
