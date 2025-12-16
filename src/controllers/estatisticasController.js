import db from "../config/database.js";

// 1) Última leitura de uma sala
export const ultimaLeitura = async (req, res) => {
    try {
        const { id_sala } = req.params;
        const [rows] = await db.query(
            `SELECT l.id_decibeis, l.decibeis, l.data_hora, s.nome_sala
             FROM leitura_ruido l
             JOIN sala_de_aula s ON s.id_sala = l.id_sala
             WHERE l.id_sala = ?
             ORDER BY l.data_hora DESC
             LIMIT 1`,
            [id_sala]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Nenhuma leitura encontrada para essa sala" });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error("ultimaLeitura:", err);
        res.status(500).json({ error: "Erro interno" });
    }
};

// 2) Leituras das últimas X horas
export const ultimasHoras = async (req, res) => {
    try {
        const { id_sala } = req.params;
        const horas = parseInt(req.query.horas, 10) || 1;

        const [rows] = await db.query(
            `SELECT id_decibeis, decibeis, data_hora
             FROM leitura_ruido
             WHERE id_sala = ? AND data_hora >= (NOW() - INTERVAL ? HOUR)
             ORDER BY data_hora ASC`,
            [id_sala, horas]
        );

        res.json(rows);
    } catch (err) {
        console.error("ultimasHoras:", err);
        res.status(500).json({ error: "Erro interno" });
    }
};

// 3) Resumo por sala (média, max, min)
export const resumoPorSala = async (req, res) => {
    try {
        const idEscola = req.usuario.id_escola;

        const [rows] = await db.query(
            `SELECT s.id_sala, s.nome_sala,
                    ROUND(AVG(l.decibeis),2) AS media,
                    ROUND(MAX(l.decibeis),2) AS maximo,
                    ROUND(MIN(l.decibeis),2) AS minimo
             FROM sala_de_aula s
             LEFT JOIN leitura_ruido l ON s.id_sala = l.id_sala
             WHERE s.id_escola = ?
             GROUP BY s.id_sala
             ORDER BY s.nome_sala`,
            [idEscola]
        );

        res.json(rows);
    } catch (err) {
        console.error("resumoPorSala:", err);
        res.status(500).json({ error: "Erro interno" });
    }
};

// 4) Média por hora do dia
export const mediaPorHora = async (req, res) => {
    try {
        const { id_sala } = req.params;
        const dias = parseInt(req.query.dias, 10) || 1;

        const [rows] = await db.query(
            `SELECT HOUR(data_hora) AS hora,
                    ROUND(AVG(decibeis),2) AS media
             FROM leitura_ruido
             WHERE id_sala = ? AND data_hora >= (NOW() - INTERVAL ? DAY)
             GROUP BY HOUR(data_hora)
             ORDER BY hora`,
            [id_sala, dias]
        );

        res.json(rows);
    } catch (err) {
        console.error("mediaPorHora:", err);
        res.status(500).json({ error: "Erro interno" });
    }
};

// 5) Média por dia
export const mediaPorDia = async (req, res) => {
    try {
        const { id_sala } = req.params;
        const dias = parseInt(req.query.dias, 10) || 7;

        const [rows] = await db.query(
            `SELECT DATE(data_hora) AS dia,
                    ROUND(AVG(decibeis),2) AS media
             FROM leitura_ruido
             WHERE id_sala = ? AND data_hora >= (CURDATE() - INTERVAL ? DAY)
             GROUP BY DATE(data_hora)
             ORDER BY dia DESC
             LIMIT ?`,
            [id_sala, dias, dias]
        );

        res.json(rows);
    } catch (err) {
        console.error("mediaPorDia:", err);
        res.status(500).json({ error: "Erro interno" });
    }
};

// 6) Última leitura de todas as salas da escola (dashboard)
export const ultimasPorSala = async (req, res) => {
    try {
        const idEscola = req.usuario.id_escola;

        const [rows] = await db.query(
            `SELECT s.id_sala, s.nome_sala, lr.decibeis, lr.data_hora
             FROM sala_de_aula s
             LEFT JOIN (
                SELECT l.* FROM leitura_ruido l
                JOIN (
                    SELECT id_sala, MAX(data_hora) AS ultima
                    FROM leitura_ruido GROUP BY id_sala
                ) m ON l.id_sala = m.id_sala AND l.data_hora = m.ultima
             ) lr ON lr.id_sala = s.id_sala
             WHERE s.id_escola = ?
             ORDER BY s.nome_sala`,
            [idEscola]
        );

        const tVerde = 60;
        const tAmarelo = 75;

        const mapped = rows.map(r => {
            let status = "sem-dado";
            if (r.decibeis !== null) {
                if (r.decibeis < tVerde) status = "verde";
                else if (r.decibeis <= tAmarelo) status = "amarelo";
                else status = "vermelho";
            }
            return { ...r, status };
        });

        res.json(mapped);
    } catch (err) {
        console.error("ultimasPorSala:", err);
        res.status(500).json({ error: "Erro interno" });
    }
};

export const graficoLinha = async (req, res) => {
  try {
    const { id_escola } = req.user;

    const sql = `
      SELECT 
        s.id_sala,
        s.nome_sala,
        s.cor_sala,
        DATE_FORMAT(l.data_hora, '%Y-%m-%d %H:00') AS hora,
        AVG(l.decibeis) AS media_decibeis
      FROM leitura_ruido l
      INNER JOIN sala_de_aula s ON l.id_sala = s.id_sala
      WHERE s.id_escola = ?
        AND l.data_hora >= NOW() - INTERVAL 24 HOUR
      GROUP BY 
        s.id_sala,
        s.nome_sala,
        s.cor_sala,
        DATE_FORMAT(l.data_hora, '%Y-%m-%d %H:00')
      ORDER BY hora ASC;
    `;

    const [rows] = await db.query(sql, [id_escola]);
    res.json(rows);

  } catch (err) {
    console.error("ERRO GRAFICO LINHA:", err);
    res.status(500).json({ erro: "Erro gráfico linha" });
  }
};

export const graficoBarra = async (req, res) => {
  try {
    const { id_escola } = req.user;

    const sql = `
      SELECT
        s.id_sala,
        s.nome_sala,
        s.cor_sala,
        MAX(l.decibeis) AS pico_decibeis
      FROM sala_de_aula s
      LEFT JOIN leitura_ruido l
        ON l.id_sala = s.id_sala
        AND DATE(l.data_hora) = CURDATE()
      WHERE s.id_escola = ?
      GROUP BY s.id_sala, s.nome_sala, s.cor_sala
      ORDER BY pico_decibeis DESC;
    `;

    const [rows] = await db.query(sql, [id_escola]);
    res.json(rows);

  } catch (err) {
    console.error("ERRO GRAFICO BARRA PICO:", err);
    res.status(500).json({ erro: "Erro gráfico barra pico" });
  }
};