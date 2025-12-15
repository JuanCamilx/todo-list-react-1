import { useEffect, useState } from "react";

const styles = {
  body: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #e3f2fd, #bbdefb)",
    color: "#0d47a1",
    fontFamily: "Segoe UI, sans-serif",
    padding: "40px 20px",
  },
  app: {
    maxWidth: "800px",
    margin: "auto",
  },
  title: {
    textAlign: "center",
    fontSize: "2.5rem",
    marginBottom: "25px",
    color: "#0d47a1",
  },
  form: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },
  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #90caf9",
    outline: "none",
    fontSize: "16px",
    background: "#ffffff",
    color: "#0d47a1",
  },
  btn: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "none",
    background: "#42a5f5",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "14px",
  },
  card: {
    background: "rgba(255,255,255,0.75)",
    backdropFilter: "blur(10px)",
    borderRadius: "18px",
    padding: "20px",
    boxShadow: "0 10px 25px rgba(66,165,245,0.25)",
  },
  task: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #bbdefb",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  done: {
    textDecoration: "line-through",
    opacity: 0.6,
    color: "#607d8b",
  },
  smallBtn: {
    marginLeft: "8px",
    padding: "6px 10px",
    borderRadius: "8px",
    border: "none",
    background: "#90caf9",
    color: "#0d47a1",
    cursor: "pointer",
    fontSize: "12px",
  },
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const API = "http://localhost:5000/api/tasks";

  const loadTasks = async () => {
    const res = await fetch(API);
    const data = await res.json();
    setTasks(data);
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    setTitle("");
    loadTasks();
  };

  const toggleTask = async (task) => {
    await fetch(`${API}/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !task.completed }),
    });
    loadTasks();
  };

  const deleteTask = async (id) => {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    loadTasks();
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditingText(task.title);
  };

  const saveEdit = async (id) => {
    await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editingText }),
    });
    setEditingId(null);
    setEditingText("");
    loadTasks();
  };

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <div style={styles.body}>
      <div style={styles.app}>
        <h1 style={styles.title}>Lista de Tareas</h1>

        <form style={styles.form} onSubmit={addTask}>
          <input
            style={styles.input}
            placeholder="Escribe una tarea y presiona Enter"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button style={styles.btn}>Agregar</button>
          <button
            type="button"
            style={styles.btn}
            onClick={() =>
              window.open("http://localhost:5000/api/tasks/db/html", "_blank")
            }
          >
            Ver BD
          </button>
        </form>

        <div style={styles.card}>
          {tasks.map((task) => (
            <div key={task.id} style={styles.task}>
              <div style={styles.left}>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task)}
                />

                {editingId === task.id ? (
                  <input
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && saveEdit(task.id)
                    }
                  />
                ) : (
                  <span style={task.completed ? styles.done : null}>
                    {task.title}
                  </span>
                )}
              </div>

              <div>
                {editingId === task.id ? (
                  <button
                    style={styles.smallBtn}
                    onClick={() => saveEdit(task.id)}
                  >
                    Guardar
                  </button>
                ) : (
                  <button
                    style={styles.smallBtn}
                    onClick={() => startEdit(task)}
                  >
                    Editar
                  </button>
                )}
                <button
                  style={styles.smallBtn}
                  onClick={() => deleteTask(task.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
