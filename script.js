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

    document.getElementById("taskSearchForm").addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent form submission
        const username = document.getElementById("searchUsername").value;

        if (!username) {
            alert("Please enter a username.");
            return;
        }
    
        try {
            // Make the GET request to the /search endpoint
            const response = await fetch(`/search?username=${encodeURIComponent(username)}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch tasks.");
            }
    
            // Display tasks
            const taskList = document.getElementById("taskList");
            taskList.innerHTML = ""; // Clear previous results
    
            data.forEach((task) => {
                const listItem = document.createElement("li");
                listItem.className = "list-group-item";
                listItem.textContent = `Title: ${task.title}, Description: ${task.description}, Due Date: ${task.dueDate}`;
                taskList.appendChild(listItem);
            });
        } catch (error) {
            alert(error.message || "An error occurred while fetching tasks.");
        }
    });
    

    // Add a new task
    document.getElementById("taskForm").addEventListener("submit", async function(event) {
        event.preventDefault();  // Prevent the default form submission
    
        const csrfToken = document.querySelector('input[name="_csrf"]').value; // Get CSRF token
    
        const taskData = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            assignedTo: document.getElementById('assignedTo').value,
            dueDate: document.getElementById('dueDate').value
        };
    
        try {
            const response = await fetch('/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': csrfToken  // Include CSRF token in the request
                },
                body: JSON.stringify(taskData)  // Send task data as JSON
            });
    
            const result = await response.json();
            if (response.ok) {
                alert('Task created successfully');
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
    

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
