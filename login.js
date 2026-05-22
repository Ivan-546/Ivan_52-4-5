class UserManager {
    constructor() {
        this.userKey = 'maison_user';
        this.usersKey = 'maison_users';
    }
    
    registerUser(userData) {
        let users = this.getAllUsers();
        if (users.some(u => u.email === userData.email)) {
            return { success: false, message: 'Email уже зарегистрирован' };
        }
        users.push(userData);
        localStorage.setItem(this.usersKey, JSON.stringify(users));
        return { success: true, message: 'Пользователь зарегистрирован' };
    }
    
    loginUser(email, password) {
        const users = this.getAllUsers();
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            const userData = { ...user };
            delete userData.password;
            localStorage.setItem(this.userKey, JSON.stringify(userData));
            return { success: true, user: userData };
        }
        
        return { success: false, message: 'Неверный email или пароль' };
    }
    
    getAllUsers() {
        const users = localStorage.getItem(this.usersKey);
        return users ? JSON.parse(users) : [];
    }
    
    getCurrentUser() {
        const user = localStorage.getItem(this.userKey);
        return user ? JSON.parse(user) : null;
    }
    
    logoutUser() {
        localStorage.removeItem(this.userKey);
    }
}

const userManager = new UserManager();

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            alert('Пожалуйста, заполните все поля');
            return;
        }
        
        if (!isValidEmail(email)) {
            alert('Пожалуйста, введите корректный email');
            return;
        }
        
        if (password.length < 6) {
            alert('Пароль должен содержать минимум 6 символов');
            return;
        }
        
        const submitBtn = document.getElementById('submitBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'flex';
        
        setTimeout(() => {
            const result = userManager.loginUser(email, password);
            
            if (result.success) {
                // Show success message
                const successModal = document.getElementById('successModal');
                const welcomeMessage = document.getElementById('welcomeMessage');
                welcomeMessage.textContent = `Добро пожаловать, ${result.user.name}!`;
                successModal.classList.add('show');
                
                document.getElementById('loginForm').reset();
                
                submitBtn.disabled = false;
                btnText.style.display = 'block';
                btnLoader.style.display = 'none';
            } else {
                alert('Ошибка: ' + result.message);
                
                submitBtn.disabled = false;
                btnText.style.display = 'block';
                btnLoader.style.display = 'none';
            }
        }, 1500);
    });
});

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function goToHome() {
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const body = document.body;
            const currentTheme = body.classList.contains('light-theme') ? 'light' : 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            body.classList.remove('dark-theme', 'light-theme');
            body.classList.add(newTheme + '-theme');
            
            localStorage.setItem('theme', newTheme);
            
            themeToggle.textContent = newTheme === 'dark' ? '🌙' : '☀️';
        });
    }
});

document.addEventListener('keydown', (e) => {
    // T - Toggle theme
    if (e.key.toLowerCase() === 't') {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) themeToggle.click();
    }
    if (e.key === 'Enter') {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) loginForm.dispatchEvent(new Event('submit'));
    }
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Пользователь ушёл со страницы входа');
    } else {
        console.log('Пользователь вернулся на страницу входа');
    }
});

window.addEventListener('load', () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.classList.add(savedTheme + '-theme');
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.textContent = savedTheme === 'dark' ? '🌙' : '☀️';
    }
    
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }

    const currentUser = userManager.getCurrentUser();
    if (currentUser) {
        console.log('Пользователь уже авторизирован:', currentUser.name);
    }
});
