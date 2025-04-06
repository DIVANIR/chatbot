import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-analytics.js";
const firebaseConfig = {
    apiKey: "AIzaSyD40r3Ctvs9HqxWM66t37wOewPRvyjMa1M",
    authDomain: "assiatnt-19884.firebaseapp.com",
    projectId: "assiatnt-19884",
    storageBucket: "assiatnt-19884.firebasestorage.app",
    messagingSenderId: "363493597155",
    appId: "1:363493597155:web:68393c81383d34ceffcad6",
    measurementId: "G-W1T60SQ3LV",
}

export default () => {
    const firebaseApp = initializeApp(firebaseConfig)
    getAnalytics(firebaseApp)
    return firebaseApp
}