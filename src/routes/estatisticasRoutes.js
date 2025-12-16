// src/routes/estatisticasRoutes.js
import express from "express";
import { autenticarToken } from "../middleware/authMiddleware.js";
import { verificarEscola } from "../middleware/permissaoEscola.js";
import {
    ultimaLeitura,
    ultimasHoras,
    ultimasPorSala,
    mediaPorDia,
    mediaPorHora,
    resumoPorSala,
    graficoBarra,
    graficoLinha
} from "../controllers/estatisticasController.js";

const router = express.Router();

// Última leitura de uma sala
router.get("/ultima/:id_sala", autenticarToken, verificarEscola, ultimaLeitura);

// Leituras das últimas X horas
router.get("/sala/:id_sala/ultimas", autenticarToken, verificarEscola, ultimasHoras);

// Estatísticas resumo por sala
router.get("/salas", autenticarToken, resumoPorSala);

// Média por hora do dia para uma sala
router.get("/sala/:id_sala/por-hora", autenticarToken, verificarEscola, mediaPorHora);

// Média por dia (últimos N dias)
router.get("/sala/:id_sala/ultimos-dias", autenticarToken, verificarEscola, mediaPorDia);

// Última leitura de todas as salas (dashboard)
router.get("/ultimas-por-sala", autenticarToken, ultimasPorSala);


router.get("/linha", autenticarToken, graficoLinha);


router.get("/barra", autenticarToken, graficoBarra);

export default router;