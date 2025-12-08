import db from "../config/database.js";

export const verificarEscola = async (req, res, next) => {
    try {
        const idEscolaUsuario = req.usuario.id_escola;
        let idSala = req.body.id_sala || req.params.id_sala;

        if (!idSala) return next();

        const [rows] = await db.query(
            "SELECT id_escola FROM sala_de_aula WHERE id_sala = ?",
            [idSala]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Sala não encontrada" });
        }

        const escolaDaSala = rows[0].id_escola;

        if (escolaDaSala != idEscolaUsuario) {
            return res.status(403).json({ error: "Você não tem permissão para acessar dados de outra escola" });
        }

        next();
    } catch (err) {
        console.error("Erro no middleware verificarEscola:", err);
        res.status(500).json({ error: "Erro interno no servidor" });
    }
};
