import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "semaforo_app",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000
});


(async () => {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    console.log("✅ MySQL pool conectado com sucesso");
    conn.release();
  } catch (err) {
    console.error("❌ Falha ao conectar no MySQL (pool):", err.code || err.message || err);
  }
})();

export default pool;
