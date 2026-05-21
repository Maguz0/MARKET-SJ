// Autenticación con Google
const googleLoginBtn = document.getElementById('googleLogin');
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const closeModal = document.getElementById('closeModal');
const userTypeSelect = document.getElementById('userType');

// Mostrar modal login
loginBtn.addEventListener('click', () => {
    loginModal.style.display = 'flex';
});

// Cerrar modal
closeModal.addEventListener('click', () => {
    loginModal.style.display = 'none';
});

// Login con Google
googleLoginBtn.addEventListener('click', async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    const userType = userTypeSelect.value;

    try {
        const result = await firebaseAuth.signInWithPopup(provider);
        const user = result.user;

        // Guardar tipo de usuario en Firestore
        await firebaseDb.collection('users').doc(user.uid).set({
            email: user.email,
            name: user.displayName,
            type: userType,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Actualizar UI
        document.getElementById('profileName').textContent = user.displayName;
        document.getElementById('userMenu').innerHTML = `
            <span>${user.displayName}</span>
            <button id="logoutBtn">Salir</button>
        `;

        // Ocultar modal
        loginModal.style.display = 'none';

        // Habilitar funcionalidades según tipo
        if (userType === 'vendedor') {
            document.getElementById('uploadForm').style.display = 'block';
        }

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            firebaseAuth.signOut();
            document.getElementById('userMenu').innerHTML = `
                <button id="loginBtn">Iniciar Sesión</button>
            `;
            document.getElementById('profileName').textContent = '';
        });

    } catch (error) {
        console.error('Error login:', error);
        alert('Error en login: ' + error.message);
    }
});