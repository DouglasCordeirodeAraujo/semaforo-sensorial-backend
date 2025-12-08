import express from "express";
import { listarEscolas, criarEscola } from "../controllers/escolaController.js";
import { autenticarToken } from "../middleware/authMiddleware.js";


const router = express.Router();

router.get("/listar-escolas", autenticarToken, listarEscolas);
router.post("/criar-escola", autenticarToken, criarEscola);

export default router;
