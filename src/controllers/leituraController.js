import db from "../config/database.js";

export const criarLeituraESP = async (req, res) => {
    try {
        let { decibeis, id_sala } = req.body;

        if (decibeis === undefined || id_sala === undefined) {
            return res.status(400).json({ error: "decibeis e id_sala são obrigatórios" });
        }

        decibeis = Number(decibeis);
        id_sala = Number(id_sala);

        if (isNaN(decibeis) || isNaN(id_sala)) {
            return res.status(400).json({ error: "Valores inválidos enviados pela ESP" });
        }

        const [sala] = await db.query("SELECT id_sala FROM sala_de_aula WHERE id_sala = ?", [id_sala]);
        if (sala.length === 0) {
            return res.status(404).json({ error: "Sala informada não existe" });
        }

        const [result] = await db.query(
            "INSERT INTO leitura_ruido (decibeis, id_sala) VALUES (?, ?)",
            [decibeis, id_sala]
        );

        res.status(201).json({
            message: "Leitura registrada com sucesso (ESP)",
            id_decibeis: result.insertId,
            decibeis,
            id_sala
        });
    } catch (err) {
        console.error("Erro criarLeituraESP:", err);
        res.status(500).json({ error: "Erro ao registrar leitura pela ESP32", detalhes: err.message });
    }
};

export const criarLeitura = async (req, res) => {
    try {
        let { decibeis, id_sala } = req.body;

        if (decibeis === undefined || id_sala === undefined) {
            return res.status(400).json({ error: "decibeis e id_sala são obrigatórios" });
        }

        decibeis = Number(decibeis);
        id_sala = Number(id_sala);

        if (isNaN(decibeis) || isNaN(id_sala)) {
            return res.status(400).json({ error: "Valores inválidos" });
        }

        const [result] = await db.query(
            "INSERT INTO leitura_ruido (decibeis, id_sala) VALUES (?, ?)",
            [decibeis, id_sala]
        );

        res.status(201).json({
            message: "Leitura registrada com sucesso",
            id_decibeis: result.insertId
        });
    } catch (err) {
        console.error("Erro criarLeitura:", err);
        res.status(500).json({ error: "Erro ao registrar leitura" });
    }
};

export const listarLeiturasPorEscola = async (req, res) => {
    try {
        const idEscola = req.usuario.id_escola;

        const [linhas] = await db.query(
            `SELECT l.*, s.nome_sala, s.id_escola
             FROM leitura_ruido l
             JOIN sala_de_aula s ON s.id_sala = l.id_sala
             WHERE s.id_escola = ?
             ORDER BY l.data_hora DESC`,
            [idEscola]
        );

        res.json(linhas);
    } catch (err) {
        console.error("Erro listarLeiturasPorEscola:", err);
        res.status(500).json({ error: "Erro ao listar leituras" });
    }
};

export const buscarLeituraPorId = async (req, res) => {
    try {
        const id_decibeis = Number(req.params.id_decibeis);
        if (isNaN(id_decibeis)) {
            return res.status(400).json({ error: "ID da leitura inválido" });
        }

        const [rows] = await db.query(
            `SELECT l.*, s.nome_sala, s.id_escola
             FROM leitura_ruido l
             JOIN sala_de_aula s ON s.id_sala = l.id_sala
             WHERE l.id_decibeis = ?`,
            [id_decibeis]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Leitura não encontrada" });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error("Erro buscarLeituraPorId:", err);
        res.status(500).json({ error: "Erro ao buscar leitura" });
    }
};
