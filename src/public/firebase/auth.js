
import { GoogleAuthProvider, getAuth, signInWithPopup, OAuthProvider } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import initialize from "./initialize.js";

export default () => {
    const firebaseApp = initialize()
    const auth = getAuth(firebaseApp)



    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider()
        showPopupSignIn(provider)
    }

    const signInWithApple = async () => {
        const provider = new OAuthProvider('apple.com')
        provider.addScope('email')
        provider.addScope('name')

        showPopupSignIn(provider)
    }

    const signInWithFacebook = async () => {
        const provider = new OAuthProvider('facebook.com')

        showPopupSignIn(provider)
    }

    const signInWithEmailAndPassword = async (email, password) => {
        try {
            const result = await auth.signInWithEmailAndPassword(email, password)
            const { user: userAuth } = result
            user = {
                name: userAuth.displayName,
                email: userAuth.email,
                photo: userAuth.photoURL
            }
            window.location.href = '/panel'
        } catch (error) {
            return error

        }
    }

    const signUpWithEmailAndPassword = async (email, password) => {
        try {
            const result = await auth.createUserWithEmailAndPassword(email, password)
            const { user: userAuth } = result
            user = {
                name: userAuth.displayName,
                email: userAuth.email,
                photo: userAuth.photoURL
            }
            window.location.href = '/panel'
        } catch (error) {
            return error
        }
    }

    const signOut = async () => {
        try {
            await auth.signOut()
            window.location.href = '/auth/signin'
        } catch (error) {
            console.log({ error })
        }
    }

    const getUser = () => new Promise((resolve, reject) => {
        auth.onAuthStateChanged(userAuth => {
            if (userAuth) {
                if (location.pathname.includes('/auth/signin')) {
                    location.href = '/panel'
                }

                resolve({
                    //token,
                    name: userAuth.displayName,
                    email: userAuth.email,
                    photo: userAuth.photoURL,
                    id: userAuth.uid
                })

            } else {

                if (!location.pathname.includes('/auth')) {
                    location.href = '/auth/signin'
                }
                reject({ error: 'User not logged' })
            }
        })
    })

    const showPopupSignIn = async (provider) => {
        try {
            const result = await signInWithPopup(auth, provider)
            const { credential, user: userAuth } = result
            const token = credential?.accessToken;
            user = {
                token,
                name: userAuth.displayName,
                email: userAuth.email,
                photo: userAuth.photoURL
            }

            window.location.href = '/panel'

        } catch (error) {
            console.log({ error })
        }
    }

    return {
        signInWithGoogle,
        signInWithApple,
        signInWithFacebook,
        signInWithEmailAndPassword,
        signUpWithEmailAndPassword,
        signOut,
        getUser
    }

}

