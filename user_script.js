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

// Initialize the app
