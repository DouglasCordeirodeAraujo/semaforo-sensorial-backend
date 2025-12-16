import jwt from "jsonwebtoken";

export const autenticarToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token inválido" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Token expirado ou inválido" });
    }

    // 🔥 COMPATIBILIDADE TOTAL
    req.usuario = decoded; // controllers antigos
    req.user = decoded;    // padrão novo

    next();
  });
};
