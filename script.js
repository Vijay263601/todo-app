const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const datePicker = document.getElementById("datePicker");
const counter = document.getElementById("counter");
const emptyMsg = document.getElementById("emptyMsg");
const clearDoneBtn = document.getElementById("clearDone");
const darkToggle = document.getElementById("darkToggle");
const filterBtns = document.querySelectorAll(".filters button");

// Set today as default date
datePicker.value = new Date().toISOString().split("T")[0];

let currentFilter = "all";
let tasksByDate = JSON.parse(localStorage.getItem("tasksByDate")) || {};

// Load dark mode preference
document.body.classList.toggle(
  "dark",
  localStorage.getItem("dark") === "true"
);

// Event listeners
addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keydown", e => {
  if (e.key === "Enter") addTask();
});
datePicker.addEventListener("change", render);
clearDoneBtn.addEventListener("click", clearCompleted);
darkToggle.addEventListener("click", toggleDark);

filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    render();
  });
});

// Add task
function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  const date = datePicker.value;

  if (!tasksByDate[date]) {
    tasksByDate[date] = [];
  }

  tasksByDate[date].push({
    id: Date.now(),
    text: text,
    completed: false
  });

  taskInput.value = ""; // ✅ FIXED
  save();
}

// Render tasks
function render() {
  const date = datePicker.value;
  const tasks = tasksByDate[date] || [];

  taskList.innerHTML = "";
  emptyMsg.style.display = tasks.length ? "none" : "block";

  let done = 0;

  tasks
    .filter(task =>
      currentFilter === "all" ||
      (currentFilter === "done" && task.completed) ||
      (currentFilter === "pending" && !task.completed)
    )
    .forEach(task => {
      if (task.completed) done++;

      const li = document.createElement("li");

      const left = document.createElement("div");
      left.className = "task-left";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.completed;
      checkbox.addEventListener("change", () => toggleTask(task.id));

      const span = document.createElement("span");
      span.textContent = task.text;
      if (task.completed) span.classList.add("completed");

      span.addEventListener("dblclick", () => editTask(span, task));

      const delBtn = document.createElement("button");
      delBtn.textContent = "X";
      delBtn.addEventListener("click", () => deleteTask(task.id));

      left.appendChild(checkbox);
      left.appendChild(span);
      li.appendChild(left);
      li.appendChild(delBtn);
      taskList.appendChild(li);
    });

  counter.textContent = `Total: ${tasks.length} | Done: ${done} | Pending: ${tasks.length - done}`;
}

// Toggle completed
function toggleTask(id) {
  const date = datePicker.value;
  tasksByDate[date] = tasksByDate[date].map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  save();
}

// Delete task
function deleteTask(id) {
  const date = datePicker.value;
  tasksByDate[date] = tasksByDate[date].filter(task => task.id !== id);
  save();
}

// Clear completed tasks
function clearCompleted() {
  const date = datePicker.value;
  tasksByDate[date] = (tasksByDate[date] || []).filter(
    task => !task.completed
  );
  save();
}

// Edit task
function editTask(span, task) {
  const input = document.createElement("input");
  input.value = task.text;
  span.replaceWith(input);
  input.focus();

  input.addEventListener("blur", () => {
    task.text = input.value.trim() || task.text;
    save();
  });

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") input.blur();
  });
}

// Dark mode
function toggleDark() {
  const dark = document.body.classList.toggle("dark");
  localStorage.setItem("dark", dark);
}

// Save & refresh
function save() {
  localStorage.setItem("tasksByDate", JSON.stringify(tasksByDate));
  render();
}

// Initial render
render();
