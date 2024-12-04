var app = new function() {
    this.el = document.getElementById('tasks');
    this.tasks = JSON.parse(localStorage.getItem('tasks')) || []; // Get tasks from localStorage
    this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

    // List of users (for demo purposes, can be expanded)
    this.users = ['admin', 'user1', 'user2'];

    // Function to check if the user is logged in
    this.isLoggedIn = function() {
        return this.currentUser !== null;
    };

    // Fetch all tasks
    this.FetchAll = function() {
        var data = '';

        if (!this.isLoggedIn()) {
            alert('You need to log in to view tasks.');
            return;
        }

        if (this.tasks.length > 0) {
            for (i = 0; i < this.tasks.length; i++) {
                data += '<tr>';
                data += '<td>' + this.tasks[i].task + '</td>';
                data += '<td>' + this.tasks[i].assignedTo + '</td>';
                data += '<td>' + this.tasks[i].dueDate + '</td>';
                data += '<td>';
                data += '<select onchange="app.HandleAction(this, ' + i + ')">';
                data += '<option value="">Select Action</option>';
                data += '<option value="edit">Edit</option>';
                data += '<option value="delete">Delete</option>';
                data += '</select>';
                data += '</td>';
                data += '</tr>';
            }
        }
        
        this.Count(this.tasks.length);
        return this.el.innerHTML = data;
    };

    // Add a new task
    this.Add = function() {
        if (!this.isLoggedIn() || this.currentUser.role !== 'admin') {
            alert("You need to log in as an admin to add tasks.");
            return;
        }

        var taskInput = document.getElementById('add-todo');
        var task = taskInput.value;
        var assignUserSelect = document.getElementById('assign-user');
        var assignedUser = assignUserSelect.value;
        var dueDateInput = document.getElementById('due-date');
        var dueDate = dueDateInput.value;

        if (task && dueDate) {
            // Add the new task with the assigned user and due date
            this.tasks.push({ task: task.trim(), assignedTo: assignedUser, dueDate: dueDate });
            taskInput.value = '';
            dueDateInput.value = '';
            localStorage.setItem('tasks', JSON.stringify(this.tasks)); // Store tasks in localStorage
            this.FetchAll();
        }
    };

    // Search for tasks based on the selected user
    this.Search = function() {
        var searchUser = document.getElementById('search-user').value;

        var filteredTasks = this.tasks.filter(function(task) {
            return task.assignedTo === searchUser;
        });

        var data = '';
        if (filteredTasks.length > 0) {
            for (i = 0; i < filteredTasks.length; i++) {
                data += '<tr>';
                data += '<td>' + filteredTasks[i].task + '</td>';
                data += '<td>' + filteredTasks[i].assignedTo + '</td>';
                data += '<td>' + filteredTasks[i].dueDate + '</td>';
                data += '<td>';
                data += '<select onchange="app.HandleAction(this, ' + i + ')">';
                data += '<option value="">Select Action</option>';
                data += '<option value="edit">Edit</option>';
                data += '<option value="delete">Delete</option>';
                data += '</select>';
                data += '</td>';
                data += '</tr>';
            }
        } else {
            data = '<tr><td colspan="4">No tasks found for selected user.</td></tr>';
        }

        this.el.innerHTML = data;
    };

    // Handle Edit or Delete actions
    this.HandleAction = function(select, index) {
        var action = select.value;
        if (action === 'edit') {
            this.Edit(index);
        } else if (action === 'delete') {
            this.Delete(index);
        }
    };

    // Edit a task (redirect to edit page)
    this.Edit = function(index) {
        var task = this.tasks[index];
        localStorage.setItem('editTask', JSON.stringify(task));
        window.location.href = 'edit-task.html'; // Redirect to edit task page
    };

    // Delete a task
    this.Delete = function(index) {
        // Remove the task from the tasks array
        this.tasks.splice(index, 1);

        // Store the updated tasks array in localStorage
        localStorage.setItem('tasks', JSON.stringify(this.tasks));

        // Refresh the task list
        this.FetchAll();
    };

    // Count the tasks
    this.Count = function(data) {
        var el   = document.getElementById('counter');
        var name = 'Tasks';

        if (data) {
            if (data == 1) {
                name = 'Task';
            }
            el.innerHTML = data + ' ' + name;
        } else {
            el.innerHTML = 'No ' + name;
        }
    };

    // Logout function
    this.Logout = function() {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html'; // Redirect to login page
    };

    // Show the logout button if the user is logged in
    this.ShowLogoutButton = function() {
        if (this.isLoggedIn()) {
            document.getElementById('logout-button').style.display = 'block';
        }
    };
};

// Initialize the app
app.FetchAll();
app.ShowLogoutButton();
