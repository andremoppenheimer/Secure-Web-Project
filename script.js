var app = new function () {
    this.el = document.getElementById('tasks');
    this.tasks = JSON.parse(localStorage.getItem('tasks')) || []; // Get tasks from localStorage
    this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    this.currentSearchUser = ''; // Variable to store the current search filter

    // List of users (for demo purposes, can be expanded)
    this.users = ['admin', 'user1', 'user2'];

    // Check if the user is logged in
    this.isLoggedIn = function () {
        return this.currentUser !== null;
    };

    // Fetch all tasks
    this.FetchAll = function () {
        var data = '';
        if (!this.isLoggedIn()) {
            alert('You need to log in to view tasks.');
            return;
        }

        // Filter tasks based on current search user (if any)
        var tasksToDisplay = this.currentSearchUser ? this.tasks.filter(task => task.assignedTo === this.currentSearchUser) : this.tasks;

        // Display tasks for the logged-in user
        tasksToDisplay.forEach((task, i) => {
            data += '<tr>';
            data += `<td>${task.task}</td>`;
            data += `<td>${task.assignedTo}</td>`;
            data += `<td>${task.dueDate}</td>`;
            data += `<td><button class="btn btn-primary" onclick="app.HandleAction('edit', ${i})">Edit</button> `;
            data += `<button class="btn btn-danger" onclick="app.HandleAction('delete', ${i})">Delete</button></td>`;
            data += '</tr>';
        });

        if (tasksToDisplay.length === 0) {
            data = '<tr><td colspan="4">No tasks found.</td></tr>';
        }

        this.Count(tasksToDisplay.length);
        this.el.innerHTML = data;
    };

    // Add a new task
    this.Add = function () {
        if (!this.isLoggedIn() || this.currentUser.role !== 'admin') {
            alert('You need to log in as an admin to add tasks.');
            return;
        }

        var taskInput = document.getElementById('add-todo');
        var task = taskInput.value;
        var assignUserSelect = document.getElementById('assign-user');
        var assignedUser = assignUserSelect.value;
        var dueDateInput = document.getElementById('due-date');
        var dueDate = dueDateInput.value;

        if (task && dueDate) {
            this.tasks.push({ task: task.trim(), assignedTo: assignedUser, dueDate: dueDate });
            taskInput.value = '';
            dueDateInput.value = '';
            localStorage.setItem('tasks', JSON.stringify(this.tasks));
            this.FetchAll(); // Reapply the search filter if any
        }
    };

    // Search for tasks based on the selected user
    this.Search = function (searchUser) {
        if (!searchUser) {        
            searchUser = document.getElementById('search-user').value;
        }
        this.currentSearchUser = searchUser; // Store the selected user for filtering

        var data = '';
        var filteredTasks = this.tasks.filter(function (task) {
            return task.assignedTo === searchUser;
        });

        if (filteredTasks.length > 0) {
            filteredTasks.forEach((task, i) => {
                data += '<tr>';
                data += `<td>${task.task}</td>`;
                data += `<td>${task.assignedTo}</td>`;
                data += `<td>${task.dueDate}</td>`;
                data += `<td><button class="btn btn-primary" onclick="app.HandleAction('edit', ${i})">Edit</button> `;
                data += `<button class="btn btn-danger" onclick="app.HandleAction('delete', ${i})">Delete</button></td>`;
                data += '</tr>';
            });
        } else {
            data = '<tr><td colspan="4">No tasks found for the selected user.</td></tr>';
        }

        this.el.innerHTML = data;
    };

    // Handle Edit or Delete actions
    this.HandleAction = function (action, index) {
        if (action === 'edit') {
            this.Edit(index);
        } else if (action === 'delete') {
            this.Delete(index);
        }
    };

    // Edit a task in place
    this.Edit = function (index) {
        var task = this.tasks[index];
        var row = this.el.rows[index];
        var taskCell = row.cells[0];
        var assignedCell = row.cells[1];
        var dueDateCell = row.cells[2];

        // Check if the row is already in edit mode
        if (taskCell.querySelector('input')) {
            // If already in edit mode, save the changes
            var taskInput = taskCell.querySelector('input');
            var assignedInput = assignedCell.querySelector('select');
            var dueDateInput = dueDateCell.querySelector('input');

            // Update the task properties with new values
            task.task = taskInput.value;
            task.assignedTo = assignedInput.value;
            task.dueDate = dueDateInput.value;

            // Save the updated tasks array to localStorage
            localStorage.setItem('tasks', JSON.stringify(this.tasks));

            // Switch to view mode and refresh the task list
            this.FetchAll();
        } else {
            // If not in edit mode, switch to edit mode (replace with input fields)
            taskCell.innerHTML = `<input type="text" value="${task.task}" class="form-control">`;
            assignedCell.innerHTML = `<select class="form-control">
                                        ${this.users.map(user => 
                                            `<option value="${user}" ${user === task.assignedTo ? 'selected' : ''}>${user}</option>`
                                        ).join('')}
                                      </select>`;
            dueDateCell.innerHTML = `<input type="date" value="${task.dueDate}" class="form-control">`;

            var taskInput = taskCell.querySelector('input');
            var assignedInput = assignedCell.querySelector('select');
            var dueDateInput = dueDateCell.querySelector('input');
        }
    };

    this.Delete = function (index) {
        var assignedToUser = this.tasks[index].assignedTo;
        this.tasks.splice(index, 1);
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
        this.FetchAll();
        this.Search(assignedToUser); // Reapply the search filter after delete
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
