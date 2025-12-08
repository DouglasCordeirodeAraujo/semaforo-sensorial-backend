// src/services/emailService.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function enviarEmailRecuperacao(emailDestino, token) {
  const resetLink = `http://localhost:3000/reset-password.html?token=${token}`;

  const mailOptions = {
    from: `"Semáforo Sensorial" <${process.env.EMAIL_USER}>`,
    to: emailDestino,
    subject: 'Recuperação de Senha - Semáforo Sensorial',
    html: `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <h2>Recuperação de Senha</h2>
        <p>Olá,</p>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta no sistema do Semáforo Sensorial.</p>
        <p>Clique no botão abaixo para criar uma nova senha. Este link é válido por 1 hora.</p>
        <p style="margin: 20px 0;">
          <a href="${resetLink}" style="background-color: #f0e68c; color: #121212; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Redefinir Senha</a>
        </p>
        <p>Se você não solicitou esta alteração, pode ignorar este e-mail com segurança.</p>
        <hr>
        <p style="font-size: 0.9em; color: #888;">Equipe do Projeto Semáforo Sensorial</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`>>> E-mail de recuperação enviado para: ${emailDestino}`);
    return true;
  } catch (error) {
    console.error('--- ERRO AO ENVIAR E-MAIL ---', error);
    return false;
  }
}
