// Variables globales
let currentUser = null;
let currentCategory = 'ropa';

// Navegación entre secciones
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('href').replace('#', '');

        // Cambiar sección activa
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.querySelectorAll('nav a').forEach(a => {
            a.classList.remove('nav-active');
        });

        document.getElementById(target).classList.add('active');
        link.classList.add('nav-active');

        // Cargar contenido según sección
        if (target === 'home') loadHome();
        if (target === 'catalog') loadCatalog();
    });
});

// Cargar Home (Ventas Fijadas + Productos)
async function loadHome() {
    try {
        // Ventas Fijadas (2 por cliente)
        const fixedSalesQuery = await firebaseDb.collection('products')
            .where('fixed', '==', true)
            .limit(10)
            .get();

        const fixedSalesContainer = document.getElementById('fixedSales');
        fixedSalesContainer.innerHTML = '';
        fixedSalesQuery.forEach(doc => {
            const product = doc.data();
            fixedSalesContainer.innerHTML += `
                <div class="product-card">
                    <img src="${product.imageUrl}" alt="${product.name}">
                    <h4>${product.name}</h4>
                    <p class="price">$${product.price}</p>
                    <p>${product.category}</p>
                </div>
            `;
        });

        // Productos Nuevos
        const productsQuery = await firebaseDb.collection('products')
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get();

        const productGrid = document.getElementById('productGrid');
        productGrid.innerHTML = '';
        productsQuery.forEach(doc => {
            const product = doc.data();
            productGrid.innerHTML += `
                <div class="product-card">
                    <img src="${product.imageUrl}" alt="${product.name}">
                    <h4>${product.name}</h4>
                    <p class="price">$${product.price}</p>
                    <p>${product.category}</p>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error loading home:', error);
    }
}

// Cargar Catálogo por categoría
document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.category;
        loadCatalog();
    });
});

async function loadCatalog() {
    try {
        const catalogQuery = await firebaseDb.collection('products')
            .where('category', '==', currentCategory)
            .get();

        const catalogContent = document.getElementById('catalogContent');
        catalogContent.innerHTML = '';
        catalogQuery.forEach(doc => {
            const product = doc.data();
            catalogContent.innerHTML += `
                <div class="product-card">
                    <img src="${product.imageUrl}" alt="${product.name}">
                    <h4>${product.name}</h4>
                    <p class="price">$${product.price}</p>
                    <p>Vendedor: ${product.sellerName}</p>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error loading catalog:', error);
    }
}

// Buscador
document.getElementById('searchBtn').addEventListener('click', async () => {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    try {
        const productsQuery = await firebaseDb.collection('products').get();
        const searchResults = document.getElementById('searchResults');
        searchResults.innerHTML = '';
        productsQuery.forEach(doc => {
            const product = doc.data();
            if (product.name.toLowerCase().includes(searchTerm) ||
                product.category.toLowerCase().includes(searchTerm)) {
                searchResults.innerHTML += `
                    <div class="product-card">
                        <img src="${product.imageUrl}" alt="${product.name}">
                        <h4>${product.name}</h4>
                        <p class="price">$${product.price}</p>
                        <p>${product.category}</p>
                    </div>
                `;
            }
        });
    } catch (error) {
        console.error('Error searching:', error);
    }
});

// Subir Producto (Vendedores)
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = firebaseAuth.currentUser;
    if (!user || userTypeSelect.value !== 'vendedor') {
        alert('Solo vendedores pueden subir productos');
        return;
    }

    const name = document.getElementById('productName').value;
    const price = document.getElementById('productPrice').value;
    const category = document.getElementById('productCategory').value;
    const imageFile = document.getElementById('productImage').files[0];

    try {
        // Subir imagen
        const storageRef = firebaseStorage.ref(`products/${user.uid}/${Date.now()}`);
        const snapshot = await storageRef.put(imageFile);
        const imageUrl = await snapshot.ref.getDownloadURL();

        // Guardar producto en Firestore
        await firebaseDb.collection('products').add({
            name,
            price: parseFloat(price),
            category,
            imageUrl,
            sellerId: user.uid,
            sellerName: user.displayName,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            fixed: false // Por defecto no fijado
        });

        alert('Producto subido exitosamente');
        loadHome(); // Recargar
    } catch (error) {
        console.error('Error uploading:', error);
        alert('Error al subir producto');
    }
});

// Chat Online
async function loadChatContacts() {
    try {
        const usersQuery = await firebaseDb.collection('users').get();
        const chatSelect = document.getElementById('chatSelect');
        chatSelect.innerHTML = '<option value="">Seleccionar contacto</option>';
        usersQuery.forEach(doc => {
            const user = doc.data();
            if (user.email !== firebaseAuth.currentUser.email) {
                chatSelect.innerHTML += `<option value="${doc.id}">${user.name}</option>`;
            }
        });
    } catch (error) {
        console.error('Error loading contacts:', error);
    }
}

// Enviar mensaje
document.getElementById('sendMsg').addEventListener('click', async () => {
    const contactId = document.getElementById('chatSelect').value;
    const message = document.getElementById('chatMsg').value;
    const user = firebaseAuth.currentUser;

    if (!contactId || !message) {
        alert('Selecciona contacto y escribe mensaje');
        return;
    }

    try {
        await firebaseDb.collection('chats').add({
            from: user.uid,
            to: contactId,
            message,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        document.getElementById('chatMsg').value = '';
        loadChatMessages(contactId);
    } catch (error) {
        console.error('Error sending message:', error);
    }
});

// Cargar mensajes
async function loadChatMessages(contactId) {
    try {
        const chatQuery = await firebaseDb.collection('chats')
            .where('from', 'in', [firebaseAuth.currentUser.uid, contactId])
            .where('to', 'in', [firebaseAuth.currentUser.uid, contactId])
            .orderBy('timestamp')
            .get();

        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '';
        chatQuery.forEach(doc => {
            const msg = doc.data();
            const isFromMe = msg.from === firebaseAuth.currentUser.uid;
            chatMessages.innerHTML += `
                <div class="message ${isFromMe ? 'my-message' : 'other-message'}">
                    <p>${msg.message}</p>
                    <small>${new Date(msg.timestamp).toLocaleTimeString()}</small>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

// Configuración Color
document.getElementById('colorSelect').addEventListener('change', (e) => {
    const color = e.target.value;
    document.body.style.backgroundColor = color === 'default' ? '#f5f5f5' : color;
});

// Inicializar
firebaseAuth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        loadHome();
        loadChatContacts();
    }
});