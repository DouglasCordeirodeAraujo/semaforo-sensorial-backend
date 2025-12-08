import db from "../config/database.js";

export const getSalas = async (req, res) => {
    try {
        const [result] = await db.query("SELECT * FROM sala_de_aula");
        res.json(result);
    } catch (err) {
        console.error("Erro ao buscar salas:", err);
        res.status(500).json({ error: "Erro ao buscar salas" });
    }
};

export const createSala = async (req, res) => {
    try {
        const { cor_sala, nome_sala, id_escola } = req.body;

        if (!cor_sala || !nome_sala || !id_escola) {
            return res.status(400).json({ error: "Preencha todos os campos" });
        }

        const sql = "INSERT INTO sala_de_aula (cor_sala, nome_sala, id_escola) VALUES (?, ?, ?)";
        const [result] = await db.query(sql, [cor_sala, nome_sala, id_escola]);

        res.status(201).json({
            message: "Sala criada com sucesso!",
            id_sala: result.insertId
        });
    } catch (err) {
        console.error("Erro ao criar sala:", err);
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ error: "Nome da sala já existe" });
        }
        res.status(500).json({ error: "Erro ao criar sala" });
    }
};

export const getSalaById = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query("SELECT * FROM sala_de_aula WHERE id_sala = ?", [id]);

        if (result.length === 0) {
            return res.status(404).json({ error: "Sala não encontrada" });
        }

        res.json(result[0]);
    } catch (err) {
        console.error("Erro ao buscar sala:", err);
        res.status(500).json({ error: "Erro ao buscar sala" });
    }
};

export const updateSala = async (req, res) => {
    try {
        const { id } = req.params;
        const { cor_sala, nome_sala, id_escola } = req.body;

        const sql = `
            UPDATE sala_de_aula 
            SET cor_sala = ?, nome_sala = ?, id_escola = ? 
            WHERE id_sala = ?
        `;
        const [result] = await db.query(sql, [cor_sala, nome_sala, id_escola, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Sala não encontrada" });
        }

        res.json({ message: "Sala atualizada com sucesso!" });
    } catch (err) {
        console.error("Erro ao atualizar sala:", err);
        res.status(500).json({ error: "Erro ao atualizar sala" });
    }
};

export const deleteSala = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query("DELETE FROM sala_de_aula WHERE id_sala = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Sala não encontrada" });
        }

        res.json({ message: "Sala deletada com sucesso!" });
    } catch (err) {
        console.error("Erro ao deletar sala:", err);
        res.status(500).json({ error: "Erro ao deletar sala" });
    }
};
