const input = document.getElementById("task-input");
const addBtn = document.getElementById("add-btn");
const taskList = document.getElementById("task-list");


// Load tasks from localStorage if available
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
loadTasks();


addBtn.addEventListener("click", addTask);
input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTask();
});

function addTask() {
    const text = input.value.trim();
    if (text === "") return;

    const newTask = { text, completed: false };
    tasks.push(newTask);
    saveTasks();
    loadTasks();

    input.value = "";
}



// Load tasks / todos from localStorage

function loadTasks() {
    taskList.innerHTML = "";
    tasks.forEach((task, index) => {
        const li = document.createElement("li");
        if (task.completed) li.classList.add("completed");

        const span = document.createElement("span");
        span.textContent = task.text;
        span.addEventListener("click", () => toggleComplete(index));

        const delBtn = document.createElement("button");
        delBtn.innerHTML = "<i class='fa-solid fa-trash-can'></i>";
        delBtn.classList.add("delete");
        delBtn.addEventListener("click", () => deleteTask(index));



        li.appendChild(span);
        li.appendChild(delBtn);
        taskList.appendChild(li);
    })
}

function toggleComplete(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    loadTasks();
}


function deleteTask(index) {
    const li = taskList.children[index];
    li.classList.add("removing");

    li.addEventListener("transitionend", () => {
        tasks.splice(index, 1);
        saveTasks();
        loadTasks();
    }, { once: true });

}

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}



// Export and Import functionality

const exportBtn = document.getElementById("export-btn");
const importBtn = document.getElementById("import-btn");
const importFile = document.getElementById("import-file");

exportBtn.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "todo-list-" + new Date().toLocaleDateString() + "-"  + new Date().toLocaleTimeString() + ".json"
    a.click();

    URL.revokeObjectURL(url);
});



// Import
importBtn.addEventListener("click", () => importFile.click());

importFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            let data = event.target.result;

            // Handle accidental data URLs
            if(data.startsWith("data:")) {
                const base64 = data.split(",")[1];
                data = atob(base64);
            }

            const imported = JSON.parse(data);
            if(!Array.isArray(imported)) throw new Error("Invalid JSON format");

            // Merge tasks, avoid duplicates
            imported.forEach(t => {
                if(!tasks.some(existing => existing.text === t.text)) {
                    tasks.push(t);
                }
            });

            saveTasks();
            loadTasks();
            alert(`Imported ${imported.length} tasks!`);
        } catch(err) {
            console.error(err);
            alert("Error importing file: " + err.message);
        }
    };

    reader.readAsText(file);
});