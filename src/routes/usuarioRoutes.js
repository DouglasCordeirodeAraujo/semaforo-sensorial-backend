import { Router } from "express";
import {
    listarUsuarios,
    criarUsuario,
    buscarUsuarioPorId,
    atualizarUsuario,
    deletarUsuario,
    forgotPassword,
    resetPassword,
    login
} from "../controllers/usuarioController.js";
import { autenticarToken } from "../middleware/authMiddleware.js"

const router = Router();

router.get("/listar-usuarios", autenticarToken, listarUsuarios);
router.post("/criar-usuario", criarUsuario);
router.get("/listar-usuario/:id", autenticarToken, buscarUsuarioPorId);
router.put("/atualizar-usuario/:id", autenticarToken, atualizarUsuario);
router.delete("/deletar-usuario/:id", autenticarToken, deletarUsuario);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post("/login", login);

export default router;
