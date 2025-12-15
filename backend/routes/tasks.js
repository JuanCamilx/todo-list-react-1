const express = require("express");
const router = express.Router();
const pool = require("../db");

// Obtener todas las tareas (no eliminadas)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, title, completed FROM tasks WHERE deleted = false ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo tareas:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Crear una nueva tarea
router.post("/", async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: "El título es obligatorio" });
    }

    const result = await pool.query(
      "INSERT INTO tasks (title, completed, deleted) VALUES ($1, false, false) RETURNING id, title, completed, deleted",
      [title]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error creando tarea:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Actualizar título, completado o deleted
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { completed, title, deleted } = req.body;

    const result = await pool.query(
      "UPDATE tasks SET title = COALESCE($1, title), completed = COALESCE($2, completed), deleted = COALESCE($4, deleted) WHERE id = $3 RETURNING id, title, completed, deleted",
      [title ?? null, typeof completed === 'undefined' ? null : completed, id, typeof deleted === 'undefined' ? null : deleted]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: 'Tarea no encontrada' });

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error actualizando tarea:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Soft-delete: marcar como eliminada
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("UPDATE tasks SET deleted = true WHERE id = $1", [id]);
    res.json({ message: "Task soft-deleted" });
  } catch (error) {
    console.error("Error eliminando tarea:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Devuelve todas las filas (incluye eliminadas)
router.get('/db', async (req, res) => {
  try {
    const result = await pool.query("SELECT id, title, completed, deleted FROM tasks ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error('Error obteniendo DB', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Vista HTML bonita que muestra pendientes, completadas y eliminadas
router.get('/db/html', async (req, res) => {
  try {
    const host = req.protocol + '://' + req.get('host');

    const pendingQ = await pool.query("SELECT id, title FROM tasks WHERE deleted = false AND completed = false ORDER BY id ASC");
    const doneQ = await pool.query("SELECT id, title FROM tasks WHERE deleted = false AND completed = true ORDER BY id ASC");
    const deletedQ = await pool.query("SELECT id, title FROM tasks WHERE deleted = true ORDER BY id ASC");

    const pending = pendingQ.rows;
    const done = doneQ.rows;
    const deleted = deletedQ.rows;

    const html = `<!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>BD - Lista de Tareas</title>
      <style>
        :root{ --bg1:#0f172a; --card:#071430; --accent:#7c3aed; --muted:#94a3b8; --glass: rgba(255,255,255,0.03)}
        *{box-sizing:border-box}
        body{font-family:Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial; margin:0; padding:36px; background: radial-gradient(1200px 600px at 10% 10%, #071229 0%, #041223 30%, #020617 100%); color:#e6eef8}
        h1{font-size:28px; text-align:center; margin:0 0 18px}
        .container{max-width:980px; margin:18px auto; display:grid; grid-template-columns:1fr 1fr; gap:18px}
        .card{background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border-radius:12px; padding:18px; box-shadow:0 10px 30px rgba(2,6,23,0.6); transition:transform .16s ease, box-shadow .16s ease}
        .card:hover{transform:translateY(-6px); box-shadow:0 24px 48px rgba(2,6,23,0.7)}
        .card h3{margin:0 0 8px}
        ul{margin:0; padding-left:16px}
        li{margin:10px 0; color:var(--accent); font-weight:600}
        .muted{color:var(--muted); font-size:14px}
        .full-row{grid-column:1 / -1}
        a.link{display:inline-block; margin-top:12px; color:#60a5fa; text-decoration:none}
        .footer{text-align:center; margin-top:14px; font-size:14px}
        .section-sub{color:var(--muted); font-size:13px; margin-top:6px}
        @media(max-width:740px){.container{grid-template-columns:1fr}}
      </style>
    </head>
    <body>
      <h1>Base de Datos - Tareas</h1>
      <div class="container">
        <div class="card">
          <h3>Pendientes</h3>
          ${pending.length ? `<ul>${pending.map(t => `<li>${t.id} - ${escapeHtml(t.title)}</li>`).join('')}</ul>` : '<p class="muted">No hay tareas pendientes</p>'}
        </div>
        <div class="card">
          <h3>Completadas</h3>
          ${done.length ? `<ul>${done.map(t => `<li>${t.id} - ${escapeHtml(t.title)}</li>`).join('')}</ul>` : '<p class="muted">No hay tareas completadas</p>'}
        </div>
        <div class="card full-row">
          <h3>Eliminadas</h3>
          ${deleted.length ? `<ul>${deleted.map(t => `<li>${t.id} - ${escapeHtml(t.title)}</li>`).join('')}</ul>` : '<p class="muted">No hay tareas eliminadas</p>'}
          <div class="footer">
            <p>Ver JSON crudo de la BD: <a class="link" href="${host}/api/tasks/db" target="_blank">${host}/api/tasks/db</a></p>
          </div>
        </div>
      </div>
    </body>
    </html>`;

    res.send(html);
  } catch (err) {
    console.error('Error generando vista HTML', err);
    res.status(500).send('Error interno');
  }
});

function escapeHtml(str){
  if(!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

module.exports = router;
