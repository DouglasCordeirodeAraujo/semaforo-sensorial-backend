import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const testConnection = async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT)
    });
    await conn.ping();
    console.log("✅ Conexão OK");
    await conn.end();
  } catch (err) {
    console.error("❌ Erro de conexão:", err);
  }
};

testConnection();