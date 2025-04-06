import { signUpWithEmailAndPassword } from "../firebase-signin.js"
import { showError, togglePasswordVisibility } from "../script.js"

const form = document.querySelector('#registration-form')
const loading = document.querySelector('.loading')


form.addEventListener('submit', async event => {
    event.preventDefault()

    const email = form['email'].value
    const password = form['password'].value
    const confirmPassword = form['confirm_password'].value
    if (password !== confirmPassword) {
        showError('Senha e confirmação são diferentes')
        return
    }

    loading.style.display = 'block'

    try {
        await signUpWithEmailAndPassword(email, password)
        showError(await signUpWithEmailAndPassword(email, password))
    } catch (error) {
        showError(error.message)
        return
    }
    finally {
        loading.style.display = 'none'
    }


    // const p = document.querySelector('#confirm-code p')
    // p.textContent = p.textContent.replace('informado', email)
    // p.closest('.registration-container').style.display = 'block'
    // form.closest('.registration-container').style.display = 'none'

})

const verifyCode = async () => {
    const code = document.querySelector('#confirmation-code').value
    const email = form['email'].value
    loading.style.display = 'block'

    try {
        const response = await fetch('/verify-code', {
            method: 'POST',
            headers: {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify({
                email,
                code
            })
        })
        const data = await response.json()
        if (data.error) {
            showError(data.message)
            return
        }

        localStorage.setItem('token', data.token)
        localStorage.setItem('owner', data.id)
        location.href = '/'

    } catch (error) {
        showError(error.message)
        return
    }
    finally {
        loading.style.display = 'none'
    }



}

function isInvalidPassword(password) {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);
    const erros = []
    if (password.length < minLength) {
        erros.push('A senha deve ter pelo menos 6 caracteres')
    }
    if (!hasUpperCase) {
        erros.push('A senha deve conter pelo menos uma letra maiúscula')
    }
    if (!hasLowerCase) {
        erros.push('A senha deve conter pelo menos uma letra minúscula')
    } if (!hasNumber) {
        erros.push('A senha deve conter pelo menos um número')
    }
    if (!hasSpecialChar) {
        erros.push('A senha deve conter pelo menos um caractere especial (!@#$%^&*)')
    }
    return erros
}

document.querySelector('#password').addEventListener('input', ({ target }) => {
    const erros = isInvalidPassword(target.value)
    document.querySelectorAll('li').forEach(li => {
        li.className = !erros.includes(li.textContent) ? 'ok' : ''
    })
})

document.querySelectorAll('.toggle-password').forEach(togglePassword => {
    togglePassword.addEventListener('click', ({target}) =>  togglePasswordVisibility(target))
})