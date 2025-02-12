// Initialize Firebase
firebaseHandler.initialize(firebaseConfig);

// DOM Elements
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const loginPopup = document.getElementById('login-popup');
const closePopup = document.querySelector('.close-popup');
const authContainer = document.getElementById('auth-container');
const userInfo = document.getElementById('user-info');
const userEmail = document.getElementById('user-email');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const googleSignInButton = document.getElementById('google-signin');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');
const creatorLink = document.getElementById('creator-link');

// Check if user is logged in
firebaseHandler.auth.onAuthStateChanged(user => {
    if (user) {
        // User is logged in
        userInfo.style.display = 'flex';
        userEmail.textContent = user.email;
        loginButton.style.display = 'none';
        creatorLink.style.display = 'block';
    } else {
        // User is logged out
        userInfo.style.display = 'none';
        loginButton.style.display = 'block';
        creatorLink.style.display = 'none';
    }
});

// Open Login Popup
loginButton.addEventListener('click', () => {
    loginPopup.style.display = 'flex';
});

// Close Login Popup
closePopup.addEventListener('click', () => {
    loginPopup.style.display = 'none';
});

// Login with Email/Password
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        await firebaseHandler.signInWithEmail(email, password);
        loginError.textContent = '';
        loginPopup.style.display = 'none';
    } catch (error) {
        loginError.textContent = error.message;
    }
});

// Register with Email/Password
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        await firebaseHandler.signUpWithEmail(email, password);
        registerError.textContent = '';
        loginPopup.style.display = 'none';
    } catch (error) {
        registerError.textContent = error.message;
    }
});

// Google Sign-In
googleSignInButton.addEventListener('click', async () => {
    try {
        await firebaseHandler.googleSignIn();
        loginPopup.style.display = 'none';
    } catch (error) {
        console.error('Google Sign-In Error:', error);
    }
});

// Logout
logoutButton.addEventListener('click', async () => {
    try {
        await firebaseHandler.signOut();
    } catch (error) {
        console.error('Logout Error:', error);
    }
});