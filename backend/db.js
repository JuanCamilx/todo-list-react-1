const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false
});

pool
  .connect()
  .then(() => console.log("PostgreSQL conectado correctamente"))
  .catch((err) => console.error("Error conectando a PostgreSQL:", err));

module.exports = pool;
