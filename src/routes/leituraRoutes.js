import express from "express";
import { autenticarToken } from "../middleware/authMiddleware.js";
import { verificarEscola } from "../middleware/permissaoEscola.js";
import { validarApiKey } from "../middleware/apikey.js";
import {
    criarLeituraESP,
    criarLeitura,
    listarLeiturasPorEscola,
    buscarLeituraPorId } from "../controllers/leituraController.js";


const router = express.Router();

router.post("/esp", validarApiKey, criarLeituraESP);
router.post("/criar-leitura", autenticarToken, verificarEscola, criarLeitura);
router.get("/listar-leitura-escola", autenticarToken, listarLeiturasPorEscola);
router.get("/:id_decibeis", autenticarToken, verificarEscola, buscarLeituraPorId);


export default router;