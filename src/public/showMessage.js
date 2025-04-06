export const ShowMessage = ({ type = 'warn', text = '', timeout = 5000 }={}) => {
    if(!text){
        return
    }
    const colors = {
        warn: { fore: 'blue', ground: '#fdff92' },
        error: { fore: 'crimson', ground: '#ffb5c3' },
        success: { fore: 'green', ground: '#bcebbc' },
    }
    const div = document.createElement('div')
    div.style.position = 'fixed'
    div.style.top = '25px'
    div.style.left = '50%'
    div.style.transform = 'translateX(-50%)'
    div.style.border = `4px solid ${colors[type].fore}`
    div.style.color = colors[type].fore
    div.style.borderRadius = '8px'
    div.style.padding = '8px'
    div.style.backgroundColor = colors[type].ground
    div.textContent = text
    

    document.body.appendChild(div)

    if (timeout > 0) {
        setTimeout(() => div.remove(), timeout)
    }
}

ShowMessage()