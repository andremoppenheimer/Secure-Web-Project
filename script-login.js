var app = new function () {
    this.login = function () {
        var usernameInput = document.getElementById('email').value;
        var passwordInput = document.getElementById('password').value;

        fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: usernameInput,
                password: passwordInput
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Login successful') {
                // Assuming the user data (including role) is returned from the server
                localStorage.setItem('currentUser', JSON.stringify(data.user)); // Store the logged-in user

                if (data.user.role === 'admin') {
                    window.location.href = 'admin_index.html'; // Redirect to admin page
                } else {
                    window.location.href = 'user_index.html'; // Redirect to user page
                }
            } else {
                alert('Invalid credentials');
            }
        })
        .catch(err => {
            console.error('Login failed:', err);
            alert('An error occurred. Please try again.');
        });
    };
};

// Bind the login function to the login button
document.getElementById('login-btn').addEventListener('click', function () {
    app.login();
});
