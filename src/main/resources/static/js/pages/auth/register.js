document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');

    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();


        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;


        let isValid = true;

        if (!firstName) {
            document.getElementById('firstName-error').textContent = 'Fornavn er påkrevd';
            isValid = false;
        }

        if (!lastName) {
            document.getElementById('lastName-error').textContent = 'Etternavn er påkrevd';
            isValid = false;
        }

        if (!email) {
            document.getElementById('email-error').textContent = 'E-postadresse er påkrevd';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            document.getElementById('email-error').textContent = 'E-postadressen er ugyldig';
            isValid = false;
        }

        if (!password) {
            document.getElementById('password-error').textContent = 'Passord er påkrevd';
            isValid = false;
        } else if (new TextEncoder().encode(password).length > 72) {
            document.getElementById('password-error').textContent = 'Passordet kan være maksimalt 72 UTF-8-byte';
            isValid = false;
        } else if (password.length < 8) {
            document.getElementById('password-error').textContent = 'Passordet må være minst 8 tegn langt';
            isValid = false;
        } else if (!/[A-Z]/.test(password)) {
            document.getElementById('password-error').textContent = 'Passordet må inneholde minst én stor bokstav';
            isValid = false;
        } else if (!/[a-z]/.test(password)) {
            document.getElementById('password-error').textContent = 'Passordet må inneholde minst én liten bokstav';
            isValid = false;
        } else if (!/\d/.test(password)) {
            document.getElementById('password-error').textContent = 'Passordet må inneholde minst ett tall';
            isValid = false;
        }

        if (isValid) {

            const submitButton = registerForm.querySelector('button[type=submit]');
            if (submitButton.disabled) return;
            submitButton.disabled = true;
            Demo.request('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    password: password
                })
            })
            .then(() => {
                window.location.href = '/html/auth/login.html?registered=true';
            })
            .catch(error => {
                for (const [field, message] of Object.entries(error.errors || {})) {
                    const target = document.getElementById(field + '-error');
                    if (target) target.textContent = message;
                }
                if (error.message.includes('E-postadressen er allerede i bruk')) {
                    document.getElementById('email-error').textContent = 'E-postadressen er allerede i bruk';
                } else if (!Object.keys(error.errors || {}).length) {
                    alert(error.message);
                }
            })
            .finally(() => { submitButton.disabled = false; });
        }
    });
});