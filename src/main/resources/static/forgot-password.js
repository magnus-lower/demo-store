document.addEventListener('DOMContentLoaded', function() {
    const resetForm = document.getElementById('reset-form');

    resetForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Clear previous errors
        document.getElementById('email-error').textContent = '';

        const email = document.getElementById('email').value;

        // Validation
        if (!email) {
            document.getElementById('email-error').textContent = 'Email is required';
            return;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            document.getElementById('email-error').textContent = 'Email is invalid';
            return;
        }

        // Submit password reset request
        fetch('/api/auth/password-reset-request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email
            })
        })
        .then(response => {
            if (response.ok) {
                // Show success message
                document.getElementById('reset-form-container').style.display = 'none';
                document.getElementById('success-message').style.display = 'block';
            } else {
                return response.json().then(data => {
                    throw new Error(data.message || 'Password reset request failed');
                });
            }
        })
        .catch(error => {
            document.getElementById('email-error').textContent = error.message;
        });
    });
});