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

    //delete task
    document.addEventListener('DOMContentLoaded', async () => {
        // Fetch CSRF token dynamically and set it in the form
        try {
            const response = await fetch('/csrf-token');
            const data = await response.json();
            document.getElementById('csrfToken').value = data.csrfToken; // Set CSRF token dynamically
        } catch (error) {
            console.error('Error fetching CSRF token:', error);
        }
    
        // Handle delete task form submission
        const taskDeleteForm = document.getElementById('taskDeleteForm');
        taskDeleteForm.addEventListener('submit', async (event) => {
            event.preventDefault();  // Prevent default form submission
    
            // Get the title from the input field
            const title = document.getElementById('deleteTitle').value;
            const csrfToken = document.getElementById('csrfToken').value;
    
            // Ensure title is not empty
            if (!title) {
                alert('Please enter a task title.');
                return;
            }
    
            try {
                // Send DELETE request with CSRF token
                const response = await fetch('/delete', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': csrfToken // Include CSRF token in the request header
                    },
                    body: JSON.stringify({ title: title })  // Send the task title to be deleted
                });
    
                const result = await response.json();
    
                if (response.ok) {
                    alert(result.message); // Show success message
                    // Remove the task from the DOM or reset the form
                    taskDeleteForm.reset();  // Clear the input field after successful delete
                } else {
                    alert(result.message); // Show error message
                }
            } catch (error) {
                alert('Error: ' + error.message);
            }
        });
    });
    
    
    // Function to fetch CSRF token from the server
    async function getCsrfToken() {
        const response = await fetch('/csrf-token');
        const data = await response.json();
        return data.csrfToken;
    }
    
    
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
app.ShowLogoutButton();
