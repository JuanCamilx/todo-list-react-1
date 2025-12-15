const API_URL = "http://localhost:5000/api/tasks";

// Cargar tareas cuando inicia la página
document.addEventListener("DOMContentLoaded", loadTasks);

// Agregar tarea
async function addTask() {
    const input = document.getElementById("taskInput");
    const title = input.value.trim();

    if (!title) return;

    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title })
    });

        if (!res.ok) {
            const err = await res.text();
            console.error('Error creating task', err);
            alert('Error creando tarea: ' + err);
            return;
        }
        input.value = "";
        loadTasks();
}

// Cargar todas las tareas
async function loadTasks() {
    const res = await fetch(API_URL);
    const tasks = await res.json();

    const list = document.getElementById("taskList");
    list.innerHTML = "";

    tasks.forEach(task => {
        const li = document.createElement("li");

        li.innerHTML = `
            <div class="left">
              <input type="checkbox" class="task-check" id="chk-${task.id}" ${task.completed ? 'checked' : ''} onchange="toggleCompleted(${task.id}, this.checked)">
              <span contenteditable="true" class="task-text ${task.completed ? 'completed' : ''}">${task.title}</span>
            </div>
            <div class="right">
              <button class="edit-btn" onclick="updateTask(${task.id}, this)">Editar</button>
              <button class="del-btn" onclick="deleteTask(${task.id})">Eliminar</button>
            </div>
        `;

        list.appendChild(li);
    });
}

// Editar tarea
async function updateTask(id, btn) {
        const container = btn.closest('li');
        const span = container.querySelector('.task-text');

        // Toggle edit mode: if not editing, enable contentEditable and change button to 'Guardar'
        if (btn.dataset.mode !== 'editing') {
                btn.dataset.mode = 'editing';
                btn.textContent = 'Guardar';
                span.contentEditable = 'true';
                span.focus();
                // move caret to end
                const range = document.createRange();
                range.selectNodeContents(span);
                range.collapse(false);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
                return;
        }

        // Otherwise we're saving
        const newTitle = span.textContent.trim();
        span.contentEditable = 'false';
        btn.dataset.mode = '';
        btn.textContent = 'Editar';

        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle })
            });

            if (!res.ok) {
                const err = await res.text();
                console.error('Error updating task', err);
                alert('Error actualizando tarea: ' + err);
                return;
            }

            loadTasks();
        } catch (err) {
            console.error('Network error updating task', err);
            alert('Error de red al actualizar tarea');
        }
}

// Eliminar tarea
async function deleteTask(id) {
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            if (!res.ok) {
                const err = await res.text();
                console.error('Error deleting task', err);
                alert('Error eliminando tarea: ' + err);
                return;
            }
            loadTasks();
        } catch (err) {
            console.error('Network error deleting task', err);
            alert('Error de red al eliminar tarea');
        }
}

// Toggle completed from checkbox
async function toggleCompleted(id, completed) {
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completed })
            });
            if (!res.ok) {
                const err = await res.text();
                console.error('Error toggling task', err);
                alert('Error actualizando completado: ' + err);
                return;
            }
            loadTasks();
        } catch (err) {
            console.error('Network error toggling task', err);
            alert('Error de red al actualizar completado');
        }
}
