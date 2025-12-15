require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

/* 🔹 CONEXIÓN A POSTGRES (OBLIGATORIO EN RAILWAY) */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

/* 🔹 VERIFICAR CONEXIÓN */
pool.connect()
  .then(() => console.log("PostgreSQL conectado correctamente"))
  .catch(err => console.error("Error al conectar PostgreSQL", err));

/* 🔹 RUTA DE PRUEBA */
app.get("/", (req, res) => res.send("Backend OK"));

/* 🔹 RUTAS */
const tasksRouter = require("./routes/tasks");
app.use("/api/tasks", tasksRouter);

/* 🔹 PUERTO */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Backend running on port ${PORT}`)
);

/* 🔹 EXPORTAR POOL */
module.exports = pool;
