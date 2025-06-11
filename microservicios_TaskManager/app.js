let token = localStorage.getItem("token");

window.onload = () => {
  if (token) {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('task-section').style.display = 'block';
    loadTasks();
  } else {
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('task-section').style.display = 'none';
  }
};


async function register() {
  const username = document.getElementById("reg-username").value;
  const password = document.getElementById("reg-password").value;

  const res = await fetch("http://localhost:5000/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  const msg = document.getElementById("register-status");
  msg.innerText = data.message;
  msg.style.color = res.ok ? "green" : "red";

  if (res.ok) {
    msg.style.color = 'green';
    document.getElementById('reg-username').value = '';
    document.getElementById('reg-password').value = '';
  }
  else {
    msg.style.color = 'red';
    document.getElementById('reg-username').value = '';
    document.getElementById('reg-password').value = '';
  }  
}

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch("http://localhost:5000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  const msg = document.getElementById("login-status");
  msg.innerText = data.message;
  msg.style.color = res.ok ? "green" : "red";

  if (res.ok) {
    token = data.token;
    localStorage.setItem("token", token);
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('task-section').style.display = 'block';
    loadTasks();
    document.getElementById('username').value = '';
document.getElementById('password').value = '';

  }
  else {
    token = null;
    localStorage.removeItem("token");
  }  
}

async function loadTasks() {
  const res = await fetch("http://localhost:5001/tasks", {
    headers: { Authorization: "Bearer " + token },
  });
  const tasks = await res.json();
  const list = document.getElementById("task-list");
  list.innerHTML = "";

  tasks.forEach((task) => {
    const div = document.createElement("div");
    div.className = "task" + (task.status === "terminada" ? " done" : "");
    div.innerHTML = `
  <strong>${task.title}</strong><br>
  ${task.description}<br>
  Categoría: ${task.category}<br>
  Fecha límite: ${task.due_date}<br>
  Estado: ${task.status}<br>
  <button onclick='loadTaskToForm(${JSON.stringify(task)})'>Editar</button>
  <button onclick="completeTask('${task.id}')">Completar</button>
  <button onclick="deleteTask('${task.id}')">Eliminar</button>
`;
    list.appendChild(div);
  });
}

async function addTask() {
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const category = document.getElementById("category").value;
  const due_date = document.getElementById("due_date").value;

  const res = await fetch("http://localhost:5001/tasks", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, description, category, due_date }),
  });

  const data = await res.json();
  if (res.ok) {
    alert("Tarea creada");
    loadTasks();
  } else {
    alert(data.message);
  }
}

async function completeTask(id) {
  const res = await fetch(`http://localhost:5001/tasks/${id}/complete`, {
    method: "PUT",
    headers: { Authorization: "Bearer " + token },
  });
  if (res.ok) loadTasks();
}

async function deleteTask(id) {
  const res = await fetch(`http://localhost:5001/tasks/${id}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token },
  });
  if (res.ok) loadTasks();
}

// Editar tarea actual
async function editTask() {
  const id = document.getElementById("editing-id").value;
  if (!id) {
    alert("No hay tarea seleccionada para editar");
    return;
  }

  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const category = document.getElementById("category").value;
  const due_date = document.getElementById("due_date").value;

  const res = await fetch(`http://localhost:5001/tasks/${id}`, {
    method: "PUT",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, description, category, due_date }),
  });

  const data = await res.json();
  if (res.ok) {
    alert("Tarea actualizada");
    clearForm();
    loadTasks();
  } else {
    alert(data.message);
  }
}

// Cargar tarea seleccionada al formulario
function loadTaskToForm(task) {
    document.getElementById('title').value = task.title;
    document.getElementById('description').value = task.description;
    document.getElementById('category').value = task.category;
    document.getElementById('due_date').value = task.due_date;
    document.getElementById('editing-id').value = task.id;
  
    document.getElementById('btn-add').style.display = 'none';
    document.getElementById('btn-edit').style.display = 'inline-block';
  }
  

// Cerrar sesión
function logout() {
  localStorage.removeItem("token");
  token = null;
  document.getElementById('task-section').style.display = 'none';
  document.getElementById('auth-section').style.display = 'block';
  clearForm();
  alert("Sesión cerrada");
}


function clearForm() {
  document.getElementById("title").value = "";
  document.getElementById("description").value = "";
  document.getElementById("category").value = "";
  document.getElementById("due_date").value = "";
  document.getElementById("editing-id").value = "";

  document.getElementById("btn-add").style.display = "inline-block";
  document.getElementById("btn-edit").style.display = "none";
}

async function resetPassword() {
  const username = document.getElementById('reset-username').value;
  const old_password = document.getElementById('reset-old-password').value;
  const new_password = document.getElementById('reset-new-password').value;

  const res = await fetch('http://localhost:5000/update_password', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, old_password, new_password })
  });

  const data = await res.json();
  const msg = document.getElementById('reset-status');
  msg.innerText = data.message;
  msg.style.color = res.ok ? 'green' : 'red';

  if (res.ok) {
    document.getElementById('reset-username').value = '';
    document.getElementById('reset-old-password').value = '';
    document.getElementById('reset-new-password').value = '';
  }
}
