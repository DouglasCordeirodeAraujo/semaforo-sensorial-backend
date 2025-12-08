import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();

import escolaRoutes from "./routes/escolaRoutes.js";
import salasRoutes from "./routes/salasRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import leituraRoutes from "./routes/leituraRoutes.js";
import estatisticasRoutes from "./routes/estatisticasRoutes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

// segurança e logs (AQUI FOI AJUSTADO)
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false
  })
);

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/escolas", escolaRoutes);
app.use("/salas", salasRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/leituras", leituraRoutes);
app.use("/estatisticas", estatisticasRoutes);

app.get("/", (req, res) => {
  res.send("API Semáforo Sensorial funcionando! 🚦");
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

// erro global
app.use((err, req, res, next) => {
  console.error("Erro no middleware final:", err);
  res.status(err.status || 500).json({ error: err.message || "Erro interno" });
});

export default app;
