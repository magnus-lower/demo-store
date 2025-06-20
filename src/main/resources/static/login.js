document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Clear previous errors
        document.getElementById('email-error').textContent = '';
        document.getElementById('password-error').textContent = '';

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Basic validation
        let isValid = true;

        if (!email) {
            document.getElementById('email-error').textContent = 'Email is required';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            document.getElementById('email-error').textContent = 'Email is invalid';
            isValid = false;
        }

        if (!password) {
            document.getElementById('password-error').textContent = 'Password is required';
            isValid = false;
        }

        if (isValid) {
            // Submit login request
            fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Invalid email or password');
                }
            })
            .then(data => {
                // Store token in local storage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify({
                    email: data.email,
                    firstName: data.firstName,
                    lastName: data.lastName
                }));

                // Redirect to homepage
                window.location.href = 'index.html';
            })
            .catch(error => {
                document.getElementById('password-error').textContent = error.message;
            });
        }
    });
});