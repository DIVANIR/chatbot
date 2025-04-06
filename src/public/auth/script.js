
export function togglePasswordVisibility(el) {
    const passwordInput = el.parentElement.querySelector('[type="password"]') ?? el.parentElement.querySelector('[type="text"]');
    const togglePassword = el
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        togglePassword.textContent = '👁️'; // Alterne o ícone para um olho aberto
    } else {
        passwordInput.type = 'password';
        togglePassword.textContent = '🙈'; // Alterne o ícone para um olho fechado 
    }
}

export const showError = (message) => {
    const messageElements = document.querySelectorAll('.message')
    messageElements.forEach(messageElement => {
        messageElement.textContent = message
    })
    setInterval(() => messageElements.forEach(messageElement => {
        messageElement.textContent = ''
    }), 8000)
}

