var app = new function() {
    this.users = [
        { username: 'admin', password: 'adminpass', role: 'admin' },
        { username: 'user', password: 'userpass', role: 'user' }
    ];
    
    // Login function
    this.Login = function() {
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
        
        // Check if the username and password match any user in the array
        var user = this.users.find(user => user.username === username && user.password === password);
        
        if (user) {
            // Store the current user in localStorage
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Redirect to the main tasks page
            window.location.href = 'index.html';
        } else {
            alert('Invalid username or password');
        }
    };
};
