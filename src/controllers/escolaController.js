import db from "../config/database.js";

export const listarEscolas = async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM escola");
        res.status(200).json(results);
    } catch (err) {
        console.error("Erro ao buscar escolas:", err);
        res.status(500).json({ error: "Erro ao buscar escolas" });
    }
};

export const criarEscola = async (req, res) => {
    try {
        const { nome_escola } = req.body;

        if (!nome_escola) {
            return res.status(400).json({ error: "O nome da escola é obrigatório" });
        }

        const [results] = await db.query(
            "INSERT INTO escola (nome_escola) VALUES (?)",
            [nome_escola]
        );

        res.status(201).json({
            message: "Escola criada com sucesso!",
            id_escola: results.insertId
        });
    } catch (err) {
        console.error("Erro ao criar escola:", err);
        res.status(500).json({ error: "Erro ao criar escola" });
    }
};
