import { Router } from "express";
import { 
    getSalas, 
    createSala, 
    getSalaById, 
    updateSala, 
    deleteSala 
} from "../controllers/salasController.js";
import { autenticarToken } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/listar-salas", autenticarToken, getSalas);
router.post("/criar-sala", autenticarToken, createSala);
router.get("/listar-sala/:id", autenticarToken, getSalaById);
router.put("/atualizar-sala/:id", autenticarToken, updateSala);
router.delete("/deletar-sala/:id", autenticarToken, deleteSala);


export default router;
