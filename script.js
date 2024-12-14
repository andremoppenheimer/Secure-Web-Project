var app = new function () {
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
    
          const csrfToken = document.getElementById('csrfToken').value; // Get CSRF token dynamically
   
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
const csrfToken = document.getElementById('csrfTokenEdit').value; // Get CSRF token

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
                    // Optionally remove the task from the DOM or reset the form
                    taskDeleteForm.reset();  // Clear the input field after successful delete
                } else {
                    alert(result.message); // Show error message
                }
            } catch (error) {
                alert('Error: ' + error.message);
            }
        });
    });
    
    // Fetch CSRF token for edit form
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/csrf-token');
        const data = await response.json();
        document.getElementById('csrfTokenEdit').value = data.csrfToken; // Set CSRF token dynamically
    } catch (error) {
        console.error('Error fetching CSRF token for edit:', error);
    }
});

// Handle Edit Task Form Submission
document.getElementById('taskEditForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    const currentTitle = document.getElementById('currentTitle').value.trim();
    const newTitle = document.getElementById('newTitle').value.trim();
    const description = document.getElementById('descriptionEdit').value.trim();
    const assignedTo = document.getElementById('assignedToEdit').value.trim();
    const dueDate = document.getElementById('dueDateEdit').value;

    const csrfToken = document.getElementById('csrfTokenEdit').value;

    if (!currentTitle) {
        alert('Please enter the current task title.');
        return;
    }

    try {
        const response = await fetch('/edit', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'CSRF-Token': csrfToken, // Include CSRF token in the headers
            },
            body: JSON.stringify({ 
                title: currentTitle, 
                newTitle, 
                description, 
                assignedTo, 
                dueDate 
            }),
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message); // Show success message
        } else {
            alert(`Error: ${result.message}`); // Show error message
        }
    } catch (error) {
        console.error('Error editing task:', error);
        alert('An error occurred while editing the task. Please try again.');
    }

    // Optionally, reset the form after submission
    document.getElementById('taskEditForm').reset();
});

    
    // Function to fetch CSRF token from the server
    async function getCsrfToken() {
        const response = await fetch('/csrf-token');
        const data = await response.json();
        return data.csrfToken;
    }
    
    document.getElementById('logoutBtn').addEventListener('click', async function () {
        try {
            const csrfToken = document.getElementById('csrfToken').value; // Get CSRF token dynamically
            const response = await fetch('/logout', { 
                method: 'POST',  // Use POST for logout
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': csrfToken,
                    // Include any necessary credentials (like cookies or tokens) if needed
                },
     redirect: 'follow'  // Follow the redirect automatically
            });
    
            if (response.ok) {
                window.location.href = 'login.html';  // Redirect to login page after successful logout
            } else {
                alert('Failed to logout. Please try again.');
            }
        } catch (error) {
            console.error('Logout failed:', error);
            alert('An error occurred while logging out.');
        }
    });
    
    

};
