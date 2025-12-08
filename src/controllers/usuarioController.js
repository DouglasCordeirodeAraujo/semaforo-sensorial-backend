import db from "../config/database.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { enviarEmailRecuperacao } from "../services/emailService.js";

export const listarUsuarios = async (req, res) => {
    try {
        const [result] = await db.query("SELECT id_usuario, email, nome_usuario, id_escola FROM usuario");
        res.json(result);
    } catch (err) {
        console.error("Erro ao listar usuários:", err);
        res.status(500).json({ error: "Erro ao buscar usuários" });
    }
};

export const criarUsuario = async (req, res) => {
    try {
        const { email, nome_usuario, senha_usuario, id_escola } = req.body;

        if (!email || !nome_usuario || !senha_usuario || !id_escola) {
            return res.status(400).json({ error: "Preencha todos os campos" });
        }

        const senhaHash = await bcrypt.hash(senha_usuario, 10);

        const sql = `
            INSERT INTO usuario (email, nome_usuario, senha_usuario, id_escola)
            VALUES (?, ?, ?, ?)
        `;

        const [result] = await db.query(sql, [email, nome_usuario, senhaHash, id_escola]);

        res.status(201).json({
            message: "Usuário criado com sucesso!",
            id_usuario: result.insertId
        });
    } catch (err) {
        console.error("Erro ao criar usuário:", err);
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ error: "Email ou nome de usuário já existe" });
        }
        res.status(500).json({ error: "Erro interno do servidor" });
    }
};

export const buscarUsuarioPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query(
            "SELECT id_usuario, email, nome_usuario, id_escola FROM usuario WHERE id_usuario = ?",
            [id]
        );

        if (result.length === 0) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        res.json(result[0]);
    } catch (err) {
        console.error("Erro ao buscar usuário:", err);
        res.status(500).json({ error: "Erro ao buscar usuário" });
    }
};

export const atualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, nome_usuario, senha_usuario, id_escola } = req.body;

        const senhaHash = senha_usuario ? await bcrypt.hash(senha_usuario, 10) : null;

        const sql = `
            UPDATE usuario SET
                email = ?,
                nome_usuario = ?,
                senha_usuario = COALESCE(?, senha_usuario),
                id_escola = ?
            WHERE id_usuario = ?
        `;

        const [result] = await db.query(sql, [email, nome_usuario, senhaHash, id_escola, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        res.json({ message: "Usuário atualizado com sucesso!" });
    } catch (err) {
        console.error("Erro ao atualizar usuário:", err);
        res.status(500).json({ error: "Erro ao atualizar usuário" });
    }
};

export const deletarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query("DELETE FROM usuario WHERE id_usuario = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        res.json({ message: "Usuário deletado com sucesso!" });
    } catch (err) {
        console.error("Erro ao deletar usuário:", err);
        res.status(500).json({ error: "Erro ao deletar usuário" });
    }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ mensagem: 'O e-mail é obrigatório.' });
    }

    const sqlFindUser = 'SELECT * FROM usuario WHERE email = ?';
    const [users] = await db.query(sqlFindUser, [email]); // <-- aqui

    if (users.length === 0) {
      console.log(`Tentativa de recuperação para e-mail não cadastrado: ${email}`);
      return res.status(200).json({
        mensagem: 'Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.'
      });
    }

    const user = users[0];

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hora

    const sqlUpdateToken = 'UPDATE usuario SET reset_token = ?, reset_token_expires = ? WHERE id_usuario = ?';
    await db.query(sqlUpdateToken, [resetToken, expires, user.id_usuario]); // <-- aqui

    const emailEnviado = await enviarEmailRecuperacao(user.email, resetToken);

    if (emailEnviado) {
      return res.status(200).json({
        mensagem: 'Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.'
      });
    } else {
      return res.status(500).json({ mensagem: 'Erro ao enviar o e-mail de recuperação.' });
    }

  } catch (err) {
    console.error("ERRO EM FORGOT PASSWORD:", err);
    return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ mensagem: 'Token e nova senha são obrigatórios.' });
    }

    const sqlFindUser = 'SELECT * FROM usuario WHERE reset_token = ? AND reset_token_expires > NOW()';
    const [users] = await db.query(sqlFindUser, [token]); // <-- aqui

    if (users.length === 0) {
      return res.status(400).json({ mensagem: 'Token inválido ou expirado.' });
    }

    const user = users[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const sqlUpdatePassword = `
      UPDATE usuario 
      SET senha_usuario = ?, reset_token = NULL, reset_token_expires = NULL 
      WHERE id_usuario = ?
    `;
    await db.query(sqlUpdatePassword, [hashedPassword, user.id_usuario]); // <-- aqui

    if (req.session) {
      req.session.destroy();
    }

    return res.status(200).json({ mensagem: 'Senha redefinida com sucesso!' });

  } catch (err) {
    console.error("ERRO EM RESET PASSWORD:", err);
    return res.status(500).json({ mensagem: 'Erro interno no servidor ao redefinir a senha.' });
  }
};

export const login = async (req, res) => {
    try {
        const { email, senha_usuario } = req.body;

        if (!email || !senha_usuario) {
            return res.status(400).json({ error: "Informe email e senha" });
        }

        const [rows] = await db.query("SELECT * FROM usuario WHERE email = ?", [email]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        const usuario = rows[0];
        const senhaValida = await bcrypt.compare(senha_usuario, usuario.senha_usuario);

        if (!senhaValida) {
            return res.status(401).json({ error: "Senha incorreta" });
        }

        const token = jwt.sign(
            { id_usuario: usuario.id_usuario, id_escola: usuario.id_escola },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            message: "Login realizado com sucesso!",
            token
        });
    } catch (err) {
        console.error("Erro ao fazer login:", err);
        res.status(500).json({ error: "Erro ao fazer login" });
    }
};
