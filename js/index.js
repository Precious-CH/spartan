const BASE_URL = "http://localhost:5000/api";


document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname;

  if (currentPage.includes("index.html")) {
      handleLogin();
  } else if (currentPage.includes("register.html")) {
      const registerForm = document.getElementById("registerForm");
      if (registerForm) {
          registerForm.addEventListener("submit", handleRegister);
      }
  } else if (currentPage.includes("dashboard.html")) {
      renderTasks();
      setupTaskActions();
  } else if (currentPage.includes("create-task.html")) {
      handleCreateTask();
  } else if (currentPage.includes("edit-task.html")) {
      handleEditTask();
  } else if (currentPage.includes("logout.html")) {
      handleLogout();
  }
});

// Simulated Database
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  

  
  /**
   * Handle Registration Page
   */
  async function handleRegister(event) {
   event.preventDefault();
  
    // Ensure the form elements are present before accessing them
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
  
    // Check if the elements exist
    if (!nameInput || !emailInput || !passwordInput) {
      console.error("One or more input elements are missing.");
      alert("Form elements not found. Please check your HTML.");
      return;
    }
  
    const name = nameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
  
    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert("Registration successful! Please log in.");
        window.location.href = "index.html"; // Redirect to login page
      } else {
        alert(data.message || "Registration failed!");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred during registration.");
    }
  }
  async function handleLogin(event) {
    event.preventDefault();
  
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
  
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        localStorage.setItem("token", data.token); // Store JWT in localStorage
        alert("Login successful!");
        window.location.href = "dashboard.html"; // Redirect to dashboard
      } else {
        alert(data.message || "Invalid email or password!");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred during login.");
    }
  }

  const loginForm = document.getElementById("loginForm");
  if (loginForm) loginForm.addEventListener("submit", handleLogin);

  
  /**
   * Handle Dashboard
   */
  function renderTasks() {
    const tasksContainer = document.getElementById("task-list");
    tasksContainer.innerHTML = ""; // Clear previous content
  
    // Check if tasks array is undefined or empty
    if (!tasks || tasks.length === 0) {
      tasksContainer.innerHTML = "<p>No tasks available. Create a new task to get started!</p>";
      return; // Stop further execution
    }
  
    // Loop through and display tasks
    tasks.forEach((task, index) => {
      const taskElement = document.createElement("div");
      taskElement.classList.add("task");
  
      taskElement.innerHTML = `
        <h3>${task.title}</h3>
        <p>${task.description}</p>
        <p class="priority">Priority: ${task.priority}</p>
        <p>Deadline: ${new Date(task.deadline).toLocaleDateString()}</p>
        <div class="actions">
          <button class="edit" data-index="${index}">Edit</button>
          <button class="delete" data-index="${index}">Delete</button>
        </div>
      `;
  
      tasksContainer.appendChild(taskElement);
    });
  }
  
  
  function setupTaskActions() {
    const tasksContainer = document.getElementById("task-list");
    tasksContainer.addEventListener("click", (e) => {
      const target = e.target;
  
      if (target.classList.contains("delete")) {
        const index = target.getAttribute("data-index");
        tasks.splice(index, 1);
        localStorage.setItem("tasks", JSON.stringify(tasks));
        renderTasks();
      }
  
      if (target.classList.contains("edit")) {
        const index = target.getAttribute("data-index");
        localStorage.setItem("editTaskIndex", index);
        window.location.href = "edit-task.html";
      }
    });
  }
  
  /**
   * Handle Create Task Page
   */
  function handleCreateTask() {
    const createTaskForm = document.getElementById("createTaskForm");
    createTaskForm.addEventListener("submit", (e) => {
      e.preventDefault();
  
      const title = document.getElementById("title").value;
      const description = document.getElementById("description").value;
      const priority = document.getElementById("priority").value;
      const deadline = document.getElementById("deadline").value;
  
      tasks.push({ title, description, priority, deadline });
      localStorage.setItem("tasks", JSON.stringify(tasks));
      alert("Task created successfully!");
      window.location.href = "dashboard.html";
    });
  }
  
  /**
   * Handle Edit Task Page
   */
  function handleEditTask() {
    const editTaskForm = document.getElementById("editTaskForm");
    const editTaskIndex = localStorage.getItem("editTaskIndex");
    const task = tasks[editTaskIndex];
  
    // Pre-fill the form
    document.getElementById("title").value = task.title;
    document.getElementById("description").value = task.description;
    document.getElementById("priority").value = task.priority;
    document.getElementById("deadline").value = task.deadline;
  
    // Save changes
    editTaskForm.addEventListener("submit", (e) => {
      e.preventDefault();
  
      task.title = document.getElementById("title").value;
      task.description = document.getElementById("description").value;
      task.priority = document.getElementById("priority").value;
      task.deadline = document.getElementById("deadline").value;
  
      tasks[editTaskIndex] = task;
      localStorage.setItem("tasks", JSON.stringify(tasks));
      alert("Task updated successfully!");
      window.location.href = "dashboard.html";
    });
  }
  
  /**
   * Handle Logout Page
   */
  function handleLogout() {
    // Clear session or authentication data
    alert("You have been logged out.");
    window.location.href = "index.html";
  }
  
  
  async function fetchProtectedData() {
    const token = localStorage.getItem("token");
  
    if (!token) {
      alert("Session expired. Please log in again.");
      localStorage.removeItem("token");
      window.location.href = "index.html";
    }
  
    try {
      const response = await fetch(`${BASE_URL}/tasks`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`, // Include token in header
        },
      });
  
      if (response.ok) {
        const tasks = await response.json();
        console.log("Tasks:", tasks);
        // Render tasks in the UI
      } else {
        alert("Failed to fetch tasks. Please log in again.");
        localStorage.removeItem("token"); // Clear invalid token
        window.location.href = "index.html"; // Redirect to login
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
 
  
