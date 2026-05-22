document.addEventListener('click', (e) => {
    // Stop any clicks on catalog items
    if (e.target.closest('.catalog-item') || e.target.closest('.catalog-grid')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
}, true);

let scene, camera, renderer, ringsGroup;
let isDragging3d = false;
let lastPointerX = 0;
let lastPointerY = 0;
let userRotX = 0;
let userRotY = 0;
let autoSpin = 0.004;

function resizeThreeCanvas() {
    const canvas = document.getElementById('canvas3d');
    const wrap = document.getElementById('hero3d');
    if (!canvas || !renderer || !camera || !wrap) return;

    const w = wrap.clientWidth;
    const h = wrap.clientHeight - (wrap.querySelector('.hero-3d-hint')?.offsetHeight || 0);
    const size = Math.max(200, Math.min(w, h));

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size, size, false);
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    camera.aspect = 1;
    camera.updateProjectionMatrix();
}

function setupRingDrag(canvas) {
    const onPointerDown = (e) => {
        isDragging3d = true;
        canvas.classList.add('is-dragging');
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
        canvas.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e) => {
        if (!isDragging3d) return;
        const dx = e.clientX - lastPointerX;
        const dy = e.clientY - lastPointerY;
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
        userRotY += dx * 0.012;
        userRotX += dy * 0.012;
    };

    const onPointerUp = (e) => {
        isDragging3d = false;
        canvas.classList.remove('is-dragging');
        try {
            canvas.releasePointerCapture(e.pointerId);
        } catch (_) { /* ignore */ }
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('lostpointercapture', () => {
        isDragging3d = false;
        canvas.classList.remove('is-dragging');
    });
}

function initThreeJS() {
    const canvas = document.getElementById('canvas3d');
    if (!canvas) return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);

    camera.position.z = 5.5;

    ringsGroup = new THREE.Group();
    scene.add(ringsGroup);

    const goldMat = new THREE.MeshStandardMaterial({
        color: 0xffc84d,
        emissive: 0xd4a574,
        emissiveIntensity: 0.45,
        metalness: 0.85,
        roughness: 0.2
    });

    const lightGoldMat = new THREE.MeshStandardMaterial({
        color: 0xfff0b3,
        emissive: 0xffe08a,
        emissiveIntensity: 0.35,
        metalness: 0.75,
        roughness: 0.25,
        transparent: true,
        opacity: 0.92
    });

    const innerMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffd966,
        emissiveIntensity: 0.55,
        metalness: 0.9,
        roughness: 0.15
    });

    const ringMeshes = [
        new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.42, 48, 128), goldMat),
        new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.32, 48, 128), lightGoldMat),
        new THREE.Mesh(new THREE.TorusGeometry(2.55, 0.22, 48, 128), innerMat)
    ];
    ringMeshes[1].rotation.x = Math.PI / 3;
    ringMeshes[2].rotation.y = Math.PI / 4;
    ringMeshes.forEach((ring) => ringsGroup.add(ring));

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.6);
    dirLight.position.set(6, 8, 10);
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0xffd966, 0.9);
    backLight.position.set(-6, -2, -4);
    scene.add(backLight);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));

    const point = new THREE.PointLight(0xffc84d, 1.2, 30);
    point.position.set(0, 0, 6);
    scene.add(point);

    resizeThreeCanvas();
    setupRingDrag(canvas);
    window.addEventListener('resize', resizeThreeCanvas);

    function animate() {
        requestAnimationFrame(animate);

        if (!isDragging3d) {
            userRotY += autoSpin;
            ringMeshes[0].rotation.z += 0.003;
            ringMeshes[1].rotation.x += 0.002;
            ringMeshes[2].rotation.y -= 0.0025;
        }

        ringsGroup.rotation.x += (userRotX - ringsGroup.rotation.x) * 0.08;
        ringsGroup.rotation.y += (userRotY - ringsGroup.rotation.y) * 0.08;

        renderer.render(scene, camera);
    }

    animate();
}

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
    
    initLazyLoading();
}

function initLazyLoading() {
    const images = document.querySelectorAll('img.lazy-image[data-src]');

    const loadImage = (img) => {
        if (!img.dataset.src || img.classList.contains('loaded')) return;
        img.src = img.dataset.src;
        img.classList.add('loaded');
        img.addEventListener('load', () => img.classList.remove('lazy-image'), { once: true });
    };

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    loadImage(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '80px' });

        images.forEach((img) => imageObserver.observe(img));
    } else {
        images.forEach(loadImage);
    }
}

const fashionQuotes = [
    { text: '«Мода — это отражение времени.»', author: '— Maison Margiela' },
    { text: '«Элегантность — это отказ от лишнего.»', author: '— Коко Шанель' },
    { text: '«Стиль — это способ сказать, кто вы есть, не произнося слов.»', author: '— Рэйчел Зоу' },
    { text: '«Одежда — это архитектура тела.»', author: '— Ив Сен-Лоран' },
    { text: '«Создавайте свой собственный визуальный стиль.»', author: '— Джанни Версаче' },
    { text: '«Мода проходит, стиль остаётся.»', author: '— Ив Сен-Лоран' },
    { text: '«Красота начинается в тот момент, когда вы решаете быть собой.»', author: '— Коко Шанель' }
];

function showRandomQuote() {
    const quoteText = document.getElementById('quoteText');
    const quoteAuthor = document.getElementById('quoteAuthor');
    if (!quoteText || !quoteAuthor) return;

    let quote = fashionQuotes[Math.floor(Math.random() * fashionQuotes.length)];
    const current = quoteText.textContent;
    let attempts = 0;
    while (quote.text === current && attempts < 8) {
        quote = fashionQuotes[Math.floor(Math.random() * fashionQuotes.length)];
        attempts++;
    }

    quoteText.style.opacity = '0';
    setTimeout(() => {
        quoteText.textContent = quote.text;
        quoteAuthor.textContent = quote.author;
        quoteText.style.opacity = '1';
    }, 200);
}

function initBurgerMenu() {
    const burger = document.getElementById('burgerBtn');
    const nav = document.getElementById('mainNav');
    const overlay = document.getElementById('navOverlay');
    if (!burger || !nav) return;

    const closeMenu = () => {
        burger.classList.remove('active');
        nav.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
        burger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
    };

    const openMenu = () => {
        burger.classList.add('active');
        nav.classList.add('open');
        if (overlay) overlay.classList.add('active');
        burger.setAttribute('aria-expanded', 'true');
        document.body.classList.add('menu-open');
    };

    burger.addEventListener('click', () => {
        if (nav.classList.contains('open')) closeMenu();
        else openMenu();
    });

    if (overlay) overlay.addEventListener('click', closeMenu);

    nav.querySelectorAll('.nav-link, .nav-actions button, .nav-actions .cart-badge').forEach((el) => {
        el.addEventListener('click', closeMenu);
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) closeMenu();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('open')) closeMenu();
    });
}

function initCursorGlow() {
    const glow = document.getElementById('cursorGlow');
    const hero = document.querySelector('.hero');
    if (!glow || !hero) return;

    const header = document.getElementById('header');
    const uiSelectors = '.header, .nav, .modal, .footer, button, a, input, textarea, select, .cart-badge';

    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';

        const heroRect = hero.getBoundingClientRect();
        const inHero = e.clientX >= heroRect.left && e.clientX <= heroRect.right &&
            e.clientY >= heroRect.top && e.clientY <= heroRect.bottom;

        const headerBottom = header ? header.getBoundingClientRect().bottom : 0;
        const overUi = e.clientY < headerBottom || !!e.target.closest(uiSelectors);

        const visible = inHero && !overUi;
        glow.classList.toggle('active', visible);

        if (visible) {
            const size = e.target.closest('#hero3d, #canvas3d') ? '52px' : '40px';
            glow.style.width = size;
            glow.style.height = size;
        }
    });
}

function runCartProgress(callback) {
    const wrap = document.getElementById('cartProgressWrap');
    const fill = document.getElementById('cartProgressFill');
    if (!wrap || !fill) {
        callback();
        return;
    }

    wrap.hidden = false;
    fill.style.width = '0%';
    requestAnimationFrame(() => {
        fill.style.width = '100%';
    });

    setTimeout(() => {
        callback();
        wrap.hidden = true;
        fill.style.width = '0%';
    }, 1200);
}

function initScrollReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        items.forEach((el) => observer.observe(el));
    } else {
        items.forEach((el) => el.classList.add('visible'));
    }
}

function animateLoadingProgress(onDone) {
    const fill = document.getElementById('loadingProgressFill');
    if (!fill) {
        onDone();
        return;
    }
    let p = 0;
    const tick = setInterval(() => {
        p += Math.random() * 22 + 8;
        if (p >= 100) {
            p = 100;
            fill.style.width = '100%';
            clearInterval(tick);
            setTimeout(onDone, 200);
        } else {
            fill.style.width = p + '%';
        }
    }, 120);
}

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

function закрыть_модаль() {
    closeModal();
}

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

function добавить_товар_в_корзину(id, name, price) {
    const product = {
        id: id,
        name: name,
        price: price,
        quantity: 1
    };

    runCartProgress(() => {
        cartManager.addToCart(product);
        updateCartBadge();
        alert('✓ ' + name + ' добавлен в корзину!');
    });
}

document.querySelectorAll('button, a, .product-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
        document.body.style.cursor = 'pointer';
    });
    el.addEventListener('mouseleave', () => {
        document.body.style.cursor = 'default';
    });
});

// ===== Обработка событий прокрутки страницы =====
function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;

    const indicator = document.getElementById('scrollIndicator');
    if (indicator) {
        indicator.style.width = scrollPercent + '%';
        indicator.setAttribute('aria-valuenow', Math.round(scrollPercent));
    }

    const header = document.getElementById('header');
    if (header) {
        header.style.background = scrollTop > 50
            ? 'rgba(15, 15, 15, 0.95)'
            : 'rgba(15, 15, 15, 0.98)';
    }
}

window.addEventListener('scroll', updateScrollProgress);
window.addEventListener('resize', updateScrollProgress);
window.addEventListener('load', updateScrollProgress);


let visibilityToastTimer;

function showVisibilityToast(message) {
    const toast = document.getElementById('visibilityToast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(visibilityToastTimer);
    visibilityToastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        showVisibilityToast('Вкладка скрыта — вы ушли со страницы');
        console.log('Пользователь ушёл со страницы');
    } else {
        showVisibilityToast('С возвращением на сайт!');
        console.log('Пользователь вернулся на страницу');
    }
});


document.addEventListener('keydown', (e) => {
    // T - Toggle theme
    if (e.key.toLowerCase() === 't') {
        toggleTheme();
    }
e
    if (e.key.toLowerCase() === 'u') {
        showUserProfile();
    }

    if (e.key === 'Escape') {
        closeModal();
        closeHelpModal();
    }

    if (e.key.toLowerCase() === 's') {
        scrollToProducts();
    }

    if (e.key.toLowerCase() === 'h') {
        openHelpModal();
    }

    if (e.key.toLowerCase() === 'c') {
        showCartInfo();
    }

    if (e.key.toLowerCase() === 'q' && !e.ctrlKey && !e.metaKey) {
        const tag = document.activeElement?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
            showRandomQuote();
        }
    }
});


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

document.addEventListener('DOMContentLoaded', () => {
    const catalogItems = document.querySelectorAll('.catalog-item');
    catalogItems.forEach(item => {
        item.style.cursor = 'default';
        item.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
    });
    
    const catalogLinks = document.querySelectorAll('.catalog-grid a');
    catalogLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
        link.removeAttribute('href');
        link.removeAttribute('target');
    });
    
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

    const newQuoteBtn = document.getElementById('newQuoteBtn');
    if (newQuoteBtn) {
        newQuoteBtn.addEventListener('click', showRandomQuote);
    }

    initBurgerMenu();
    initLazyLoading();
    initCursorGlow();
    initScrollReveal();
    showRandomQuote();
});

function showUserProfile() {
    const user = cartManager.getUser();
    if (user) {
        alert(`Профиль: ${user.name}\nEmail: ${user.email}`);
    } else {
        alert('Пожалуйста, войдите в систему');
    }
}

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

function удалить_из_корзины(productId) {
    cartManager.removeFromCart(productId);
    updateCartBadge();
    showCartInfo();  
}

function показать_корзину() {
    showCartInfo();
}

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

function закрыть_справку() {
    closeHelpModal();
}

function updateCartBadge() {
    const cart = cartManager.getCart();
    const cartCounter = document.getElementById('cartCounter');
    if (cartCounter) {
        cartCounter.textContent = cart.length;
    }
}

function scrollToProducts() {
    const productsSection = document.querySelector('.products-section');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function скролл_к_товарам() {
    scrollToProducts();
}

window.addEventListener('load', () => {
    if (typeof THREE !== 'undefined') {
        setTimeout(() => initThreeJS(), 100);
    } else {
        console.error('Three.js not loaded!');
    }

    updateCartBadge();

    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.classList.add(savedTheme + '-theme');

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.textContent = savedTheme === 'dark' ? '🌙' : '☀️';
    }

    const loadingScreen = document.getElementById('loadingScreen');
    const hideLoading = () => {
        if (loadingScreen) loadingScreen.classList.add('hidden');
    };
    animateLoadingProgress(hideLoading);
});

window.addEventListener('resize', () => {
});
