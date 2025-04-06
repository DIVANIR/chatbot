import getAuth from '../../firebase/auth.js'

const auth = getAuth()
auth.getUser().finally(console.log)

document.querySelector('#google-login-btn').addEventListener('click', auth.signInWithGoogle)
//document.querySelector('#apple-login-btn').addEventListener('click', auth.signInWithApple)
document.querySelector('#facebook-login-btn').addEventListener('click', auth.signInWithFacebook)
