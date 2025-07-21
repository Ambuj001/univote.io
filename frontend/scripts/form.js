import { BACKEND_URL } from '../config.js'; 

window.addEventListener('error', (e) => {
    console.error('Script error:', e.message);
});

// Check device on page load
function checkDevice() {
    if (window.innerWidth <= 768 || /Mobi|Android|iPhone|iPad|Tablet/i.test(navigator.userAgent)) {
        alert("This application is only supported on Windows. It is not supported on Android or mobile devices.");
        window.location.href = "unsupported.html"; // Or window.history.back();
    }
}
checkDevice(); // Run on page load


// Form submission
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    document.getElementById('loadingMessage').style.display = 'block';
    document.getElementById('successMessage').style.display = 'none';
    
    const formData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value
    };

    try {
        const response = await fetch(`${BACKEND_URL}/api/SendOtp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(formData)
        });

        document.getElementById('loadingMessage').style.display = 'none';

        if (!response.ok) {
            const data = await response.json();
            const errors = data.errors || [];

            // Clear all previous errors
            ['username', 'email', 'password', 'confirmPassword'].forEach(field => {
                const errorElement = document.getElementById(`${field}Error`);
                if (errorElement) {
                    errorElement.textContent = '';
                    errorElement.style.display = 'none';
                }
            });
            
            // Display new errors
            errors.forEach(err => {
                const field = err.param || err.path;
                const message = err.msg;
                const errorElement = document.getElementById(`${field}Error`);
                if (errorElement) {
                    errorElement.style.display = 'block';
                    errorElement.textContent = message;
                } else if (field === 'form') {
                    const formError = document.getElementById('formError');
                    if (formError) {
                        formError.textContent = message;
                        formError.style.display = 'block';
                    }
                } else {
                    console.error(`${field}: ${message}`);
                }
            });
        } else {
            const data = await response.json();
            console.log('Success:', data.message);

            // Show success message
            document.getElementById('successMessage').style.display = 'block';

            // Redirect after short delay
            setTimeout(() => {
                window.location.href = './otp.html';
            }, 1000); // 1 second delay
        }            
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loadingMessage').style.display = 'none';
        const formError = document.getElementById('formError');
        if (formError) {
            formError.textContent = 'An error occurred. Please try again.';
            formError.style.display = 'block';
        }
    }
});

// Real-time password match validation
document.getElementById('confirmPassword').addEventListener('input', function() {
    const password = document.getElementById('password').value;
    const confirmPassword = this.value;
    const error = document.getElementById('confirmPasswordError');

    if (password !== confirmPassword) {
        error.style.display = 'block';
    } else {
        error.style.display = 'none';
    }
});