import nodemailer from 'nodemailer';

// Configuração do transportador usando as variáveis da Vercel
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: process.env.MAIL_PORT === '465',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  // Configuração extra para evitar erros de certificado no Outlook/Gmail
  tls: {
    rejectUnauthorized: false
  }
});

export const emailService = {
  // E-mail de Boas-vindas
  sendWelcomeEmail: async (email: string, name: string) => {
    await transporter.sendMail({
      from: `"A Grande Família Blog" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Bem-vindo à nossa comunidade! 🚀",
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h1>Olá, ${name}!</h1>
          <p>Sua conta no <b>A Grande Família Blog</b> foi criada com sucesso.</p>
          <p>Agora você já pode compartilhar seus momentos com a família!</p>
        </div>
      `,
    });
  },

  // E-mail de Recuperação de Senha
  sendResetPasswordEmail: async (email: string, link: string) => {
    await transporter.sendMail({
      from: `"A Grande Família Blog" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Recuperação de Senha 🔐",
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h2>Solicitação de nova senha</h2>
          <p>Você solicitou a redefinição de senha para sua conta.</p>
          <p>Clique no botão abaixo para escolher uma nova senha. Este link expira em 1 hora.</p>
          <a href="${link}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: #fff; text-decoration: none; border-radius: 5px;">
            Redefinir Minha Senha
          </a>
        </div>
      `,
    });
  }
};