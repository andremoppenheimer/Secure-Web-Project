var app = new function () {
    // List of users (with roles and passwords for demo purposes)
    this.users = [
        { username: 'admin', password: 'adminpass', role: 'admin' },
        { username: 'user1', password: 'user1pass', role: 'user' },
        { username: 'user2', password: 'user2pass', role: 'user' }
    ];

    this.login = function () {
        var usernameInput = document.getElementById('username').value;
        var passwordInput = document.getElementById('password').value;

        // Find user by username and password
        var user = this.users.find(u => u.username === usernameInput && u.password === passwordInput);

        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user)); // Store the logged-in user in localStorage
            
            // Redirect based on role
            if (user.role === 'admin') {
                window.location.href = 'admin_index.html'; // Redirect to admin page
            } else {
                window.location.href = 'user_index.html'; // Redirect to user page
            }
        } else {
            alert('Invalid username or password');
        }
    };
};

// Bind the login function to the login button
document.getElementById('login-btn').addEventListener('click', function () {
    app.login();
});
