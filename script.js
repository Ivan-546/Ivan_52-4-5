// ===== Three.js 3D Scene Setup =====
let scene, camera, renderer, куб;

function initThreeJS() {
    const canvas = document.getElementById('canvas3d');
    
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0.1);
    
    camera.position.z = 5;
    
    // Создаем тор (кольцо) - элегантная форма для люкс бренда
    const geometry = new THREE.TorusGeometry(2, 0.8, 32, 100);
    const материал = new THREE.MeshPhongMaterial({ 
        color: 0xd4a574, 
        emissive: 0x8b6f47,
        shininess: 100
    });
    
    куб = new THREE.Mesh(geometry, материал);
    scene.add(куб);
    
    // Второе кольцо для интересности
    const geometry2 = new THREE.TorusGeometry(3, 0.5, 32, 100);
    const материал2 = new THREE.MeshPhongMaterial({ 
        color: 0xe8d5c4, 
        emissive: 0xc4a880,
        shininess: 80,
        opacity: 0.8,
        transparent: true
    });
    const кольцо2 = new THREE.Mesh(geometry2, материал2);
    кольцо2.rotation.x = 0.5;
    scene.add(кольцо2);
    
    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Animate
    function animate() {
        requestAnimationFrame(animate);
        
        куб.rotation.x += 0.003;
        куб.rotation.y += 0.005;
        
        // Второе кольцо вращается в другую сторону
        кольцо2.rotation.x -= 0.002;
        кольцо2.rotation.z += 0.004;
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// ===== Product Data Generation =====
const productNames = [
    'Жилет из Шёлка',
    'Брюки из Натуральной Шерсти',
    'Чёрная Сумка Классик',
    'Балетки Пуант',
    'Пальто Минимализм',
    'Платье Вечернее',
    'Куртка Кожаная',
    'Рубашка Белая',
    'Юбка Макси',
    'Кардиган Шёлковый'
];

const productTypes = [
    'Верхняя одежда',
    'Брюки',
    'Аксессуары',
    'Обувь',
    'Платья',
    'Нижнее белье'
];

// Generate random products
function generateProducts(count = 8) {
    const products = [];
    for (let i = 0; i < count; i++) {
        products.push({
            id: i + 1,
            name: productNames[Math.floor(Math.random() * productNames.length)] + ' ' + (i + 1),
            type: productTypes[Math.floor(Math.random() * productTypes.length)],
            price: '$' + (Math.floor(Math.random() * 3000) + 500).toString(),
            description: 'Изделие премиум-класса из коллекции Maison Margiela.',
            image: generatePlaceholderImage(i)
        });
    }
    return products;
}

// Generate product images with real photos
function generatePlaceholderImage(index) {
    const images = [
        'https://images.unsplash.com/photo-1578979314018-36c373e5fb76?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1591769383522-17fead8e7c68?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1516762356843-ab154e5993e9?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1553374050-a1eb13edc67b?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1539533057440-7814baea1eba?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1591028519763-f8b38a0e4e38?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1524502332475-b2b3c547bead?w=400&h=500&fit=crop'
    ];
    return images[index % images.length];
}

// ===== Local Storage Management =====
class CartManager {
    constructor() {
        this.storageKey = 'maison_cart';
        this.userKey = 'maison_user';
    }
    
    addToCart(product) {
        let cart = this.getCart();
        const existingProduct = cart.find(p => p.id === product.id);
        
        if (existingProduct) {
            existingProduct.quantity++;
        } else {
            product.quantity = 1;
            cart.push(product);
        }
        
        localStorage.setItem(this.storageKey, JSON.stringify(cart));
        return cart;
    }
    
    getCart() {
        const cart = localStorage.getItem(this.storageKey);
        return cart ? JSON.parse(cart) : [];
    }
    
    removeFromCart(productId) {
        let cart = this.getCart();
        cart = cart.filter(p => p.id !== productId);
        localStorage.setItem(this.storageKey, JSON.stringify(cart));
        return cart;
    }
    
    clearCart() {
        localStorage.removeItem(this.storageKey);
    }
    
    saveUser(userData) {
        localStorage.setItem(this.userKey, JSON.stringify(userData));
    }
    
    getUser() {
        const user = localStorage.getItem(this.userKey);
        return user ? JSON.parse(user) : null;
    }
}

const cartManager = new CartManager();

// ===== Product Grid Generation =====
function displayProducts() {
    const products = generateProducts(8);
    const grid = document.getElementById('productsGrid');
    
    products.forEach((product, index) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">
                <img class="lazy-image" data-src="${product.image}" src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.type}</p>
                <div class="product-price">${product.price}</div>
            </div>
        `;
        
        card.addEventListener('click', () => openModal(product));
        grid.appendChild(card);
    });
    
    // Lazy loading
    initLazyLoading();
}

// ===== Lazy Loading Implementation =====
function initLazyLoading() {
    const images = document.querySelectorAll('img.lazy-image');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    } else {
        images.forEach(img => {
            img.src = img.dataset.src;
        });
    }
}

// ===== Modal Functions =====
let currentProduct = null;

function openModal(product) {
    currentProduct = product;
    const modal = document.getElementById('productModal');
    document.getElementById('modalImage').src = product.image;
    document.getElementById('modalTitle').textContent = product.name;
    document.getElementById('modalDescription').textContent = product.type + ' - премиум качество';
    document.getElementById('modalPrice').textContent = 'Цена: ' + product.price;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const productModal = document.getElementById('productModal');
    const cartModal = document.getElementById('cartModal');
    
    if (productModal) {
        productModal.classList.remove('show');
    }
    if (cartModal) {
        cartModal.classList.remove('show');
    }
    
    document.body.style.overflow = 'auto';
}

// Russian alias
function закрыть_модаль() {
    closeModal();
}

// ===== Add to Cart with Progress Bar =====
function addToCart() {
    if (currentProduct) {
        const progressContainer = document.querySelector('.progress-container');
        const progressFill = document.querySelector('.progress-fill');
        progressContainer.style.display = 'block';
        progressFill.style.width = '0%';
        
        setTimeout(() => {
            progressFill.style.width = '100%';
        }, 50);
        
        setTimeout(() => {
            cartManager.addToCart(currentProduct);
            updateCartBadge();
            alert('✓ Товар добавлен в корзину!');
            closeModal();
            progressContainer.style.display = 'none';
            progressFill.style.width = '0%';
        }, 2000);
    }
}

// ===== Add Product to Cart (Direct) =====
function добавить_товар_в_корзину(id, name, price) {
    const product = {
        id: id,
        name: name,
        price: price,
        quantity: 1
    };
    
    cartManager.addToCart(product);
    updateCartBadge();
    alert('✓ ' + name + ' добавлен в корзину!');
}

// ===== Cursor Effect (Background reaction) =====
document.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;
    
    // Create glow effect
    if (куб) {
        const normalizedX = (x / window.innerWidth) * 2 - 1;
        const normalizedY = -(y / window.innerHeight) * 2 + 1;
        
        куб.rotation.x += normalizedY * 0.001;
        куб.rotation.y += normalizedX * 0.001;
    }
});

// Change cursor on interactive elements
document.querySelectorAll('button, a, .product-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
        document.body.style.cursor = 'pointer';
    });
    el.addEventListener('mouseleave', () => {
        document.body.style.cursor = 'default';
    });
});

// ===== Scroll Progress Indicator =====
window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    document.getElementById('scrollIndicator').style.width = scrollPercent + '%';
    
    // Update header on scroll
    const header = document.getElementById('header');
    if (scrollTop > 50) {
        header.style.background = 'rgba(15, 15, 15, 0.95)';
    } else {
        header.style.background = 'rgba(15, 15, 15, 0.98)';
    }
});

// ===== Page Visibility API =====
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Пользователь ушёл со страницы');
    } else {
        console.log('Пользователь вернулся на страницу');
    }
});

// ===== Keyboard Shortcuts (Hot Keys) =====
document.addEventListener('keydown', (e) => {
    // T - Toggle theme
    if (e.key.toLowerCase() === 't') {
        toggleTheme();
    }
    // U - Show user profile
    if (e.key.toLowerCase() === 'u') {
        showUserProfile();
    }
    // Esc - Close modal
    if (e.key === 'Escape') {
        closeModal();
        closeHelpModal();
    }
    // S - Scroll to products
    if (e.key.toLowerCase() === 's') {
        scrollToProducts();
    }
    // H - Show help
    if (e.key.toLowerCase() === 'h') {
        openHelpModal();
    }
    // C - Show cart
    if (e.key.toLowerCase() === 'c') {
        showCartInfo();
    }
});

// ===== Theme Toggle =====
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.classList.contains('light-theme') ? 'light' : 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.classList.remove('dark-theme', 'light-theme');
    body.classList.add(newTheme + '-theme');
    
    localStorage.setItem('theme', newTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.textContent = newTheme === 'dark' ? '🌙' : '☀️';
}

// Add click handler for theme toggle button
document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('themeToggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
    
    const helpBtn = document.getElementById('helpBtn');
    if (helpBtn) {
        helpBtn.addEventListener('click', openHelpModal);
    }
    
    const userBtn = document.getElementById('userBtn');
    if (userBtn) {
        userBtn.addEventListener('click', showUserProfile);
    }
    
    const cartCounter = document.getElementById('cartCounter');
    if (cartCounter) {
        cartCounter.addEventListener('click', showCartInfo);
    }
    
    // Close modals on background click
    const productModal = document.getElementById('productModal');
    if (productModal) {
        productModal.addEventListener('click', (e) => {
            if (e.target === productModal) {
                closeModal();
            }
        });
    }
    
    const helpModal = document.getElementById('helpModal');
    if (helpModal) {
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                closeHelpModal();
            }
        });
    }
    
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                closeModal();
            }
        });
    }
});

// ===== User Profile =====
function showUserProfile() {
    const user = cartManager.getUser();
    if (user) {
        alert(`Профиль: ${user.name}\nEmail: ${user.email}`);
    } else {
        alert('Пожалуйста, войдите в систему');
    }
}

// ===== Show Cart Info =====
function showCartInfo() {
    const cart = cartManager.getCart();
    const cartModal = document.getElementById('cartModal');
    const cartItemsDiv = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartModal || !cartItemsDiv) return;
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p style="text-align: center; color: #999;">Корзина пуста</p>';
    } else {
        cartItemsDiv.innerHTML = cart.map((item, index) => `
            <div class="cart-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #eee; background: #f9f7f5; margin-bottom: 10px; border-radius: 4px;">
                <div style="flex: 1;">
                    <p style="margin: 0; font-weight: 600;">${item.name}</p>
                    <p style="margin: 5px 0 0 0; color: #d4a574; font-size: 14px;">₽ ${item.price.toLocaleString('ru-RU')}</p>
                </div>
                <button onclick="удалить_из_корзины(${item.id})" class="btn-delete" style="background: #dc3545; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">✕ Удалить</button>
            </div>
        `).join('');
    }
    
    cartTotal.textContent = cart.length;
    cartModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// ===== Remove from Cart =====
function удалить_из_корзины(productId) {
    cartManager.removeFromCart(productId);
    updateCartBadge();
    showCartInfo();  // Refresh cart display
}

// Russian alias
function показать_корзину() {
    showCartInfo();
}

// ===== Help Modal Functions =====
function openHelpModal() {
    const modal = document.getElementById('helpModal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeHelpModal() {
    const modal = document.getElementById('helpModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

// Russian alias
function закрыть_справку() {
    closeHelpModal();
}

// ===== Update Cart Badge =====
function updateCartBadge() {
    const cart = cartManager.getCart();
    const cartCounter = document.getElementById('cartCounter');
    if (cartCounter) {
        cartCounter.textContent = cart.length;
    }
}

// ===== Helper Functions =====
function scrollToProducts() {
    const productsSection = document.querySelector('.products-section');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Russian alias for scroll function
function скролл_к_товарам() {
    scrollToProducts();
}

// ===== Initialization =====
window.addEventListener('load', () => {
    // Initialize Three.js
    initThreeJS();
    
    // Update cart badge to show items from localStorage
    updateCartBadge();
    
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.add(savedTheme + '-theme');
    
    // Update theme toggle button icon
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.textContent = savedTheme === 'dark' ? '🌙' : '☀️';
    }
    
    // Hide loading screen
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.classList.add('hidden');
    }, 1500);
});

// Handle window resize for products grid
window.addEventListener('resize', () => {
    // Re-render on resize if needed
});
