document.getElementById('password-change-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const newPassword = document.getElementById('new-password').value;
    const confirmNewPassword = document.getElementById('confirm-new-password').value;

    const id =  location.search.split('=')[1]
    fetch('/update-password/' + id, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            newPassword,
            confirmNewPassword
        })

    }).then(response => {
        if (response.status === 200) {
            const messageElement = document.querySelector('.message')
            messageElement.textContent = 'Senha alterada com sucesso!'
            messageElement.style.color = 'green'
            messageElement.style.backgroundColor = '#0f05'
            messageElement.style.borderColor = 'green'
        }
    })
});

function togglePasswordVisibility(id) {
    const passwordInput = document.getElementById(id);
    const togglePassword = passwordInput.nextElementSibling;

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        togglePassword.textContent = '🙈'; // Alterne o ícone para um olho fechado
    } else {
        passwordInput.type = 'password';
        togglePassword.textContent = '👁️'; // Alterne o ícone para um olho aberto
    }
}
