// Configuración Firebase
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_PROJECT.firebaseapp.com",
    projectId: "TU_PROJECT",
    storageBucket: "TU_PROJECT.appspot.com",
    messagingSenderId: "TU_SENDER_ID",
    appId: "TU_APP_ID"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Exportar módulos
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Exportar para uso en otros archivos
window.firebaseAuth = auth;
window.firebaseDb = db;
window.firebaseStorage = storage;