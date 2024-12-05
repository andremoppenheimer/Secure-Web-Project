var app = new function () {
    this.el = document.getElementById('tasks');
    this.tasks = JSON.parse(localStorage.getItem('tasks')) || []; // Get tasks from localStorage
    this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

    // Check if the user is logged in
    this.isLoggedIn = function () {
        return this.currentUser !== null;
    };

    // Fetch tasks assigned to the current user (or show all tasks for admins)
    this.FetchAll = function () {
        var data = '';
        if (!this.isLoggedIn()) {
            alert('You need to log in to view tasks.');
            return;
        }

        // If the user is an admin, show all tasks
        // If the user is a regular user, show only tasks assigned to them
        var tasksToDisplay = (this.currentUser.role === 'admin') ? this.tasks : this.tasks.filter(task => task.assignedTo === this.currentUser.username);

        tasksToDisplay.forEach((task, i) => {
            data += '<tr>';
            data += `<td>${task.task}</td>`;
            data += `<td>${task.dueDate}</td>`;
            data += '</tr>';
        });

        if (tasksToDisplay.length === 0) {
            data = '<tr><td colspan="2">No tasks found.</td></tr>';
        }

        this.Count(tasksToDisplay.length);
        this.el.innerHTML = data;
    };

    // Count the tasks
    this.Count = function (data) {
        var el = document.getElementById('counter');
        var name = 'Tasks';

        if (data) {
            el.innerHTML = `${data} ${data === 1 ? 'Task' : 'Tasks'}`;
        } else {
            el.innerHTML = `No ${name}`;
        }
    };

    // Logout function
    this.Logout = function () {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    };

    // Show the logout button if the user is logged in
    this.ShowLogoutButton = function () {
        if (this.isLoggedIn()) {
            document.getElementById('logout-button').style.display = 'block';
        }
    };
};

// Initialize the app
app.FetchAll();
app.ShowLogoutButton();
