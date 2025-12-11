document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();


        document.getElementById('email-error').textContent = '';
        document.getElementById('password-error').textContent = '';

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;


        let isValid = true;

        if (!email) {
            document.getElementById('email-error').textContent = 'E-post er påkrevd';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            document.getElementById('email-error').textContent = 'E-post er ugyldig';
            isValid = false;
        }

        if (!password) {
            document.getElementById('password-error').textContent = 'Passord er påkrevd';
            isValid = false;
        }

        if (isValid) {

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
                    throw new Error('Ugyldig e-post eller passord');
                }
            })
            .then(data => {

                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify({
                    email: data.email,
                    firstName: data.firstName,
                    lastName: data.lastName
                }));


                window.location.href = '/html/index.html';
            })
            .catch(error => {
                document.getElementById('password-error').textContent = error.message;
            });
        }
    });
});