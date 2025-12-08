export const validarApiKey = (req, res, next) => {
    const apiKeyHeader = req.headers["x-api-key"];
    if (!apiKeyHeader) return res.status(401).json({ error: "API Key não enviada" });
    if (apiKeyHeader !== process.env.API_KEY_ESP) return res.status(403).json({ error: "API Key inválida" });
    next();
};
