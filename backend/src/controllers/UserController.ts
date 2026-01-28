import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { emailService } from '../services/EmailService'; // Importação do serviço de e-mail
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const userService = new UserService();

// Regex: Mínimo 6 caracteres e ao menos 1 símbolo especial
const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/;

export const userController = {

  create: async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    // 1. Validações Iniciais
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    // 2. Validação de Força da Senha (antes de qualquer ação)
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "A senha deve ter pelo menos 6 caracteres e um símbolo especial."
      });
    }

    try {
      const newUser = await userService.register({ name, email, password });

      // 3. Disparo de E-mail de Boas-vindas (Não bloqueia a resposta da API)
      emailService.sendWelcomeEmail(email, name).catch(err => 
        console.error("Falha ao enviar e-mail de boas-vindas:", err)
      );

      return res.status(201).json(newUser);

    } catch (error: any) {
      // Erro de e-mail duplicado no Prisma (Código P2002)
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return res.status(409).json({ message: "This email is already registered." });
      }
      
      if (error.message === 'User already exists') {
        return res.status(409).json({ message: "This email is already registered." });
      }

      console.error(error);
      return res.status(500).json({ message: "An unexpected server error occurred." });
    }
  },

  authenticate: async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
      }

      const result = await userService.login({ email, password });

      // Cookie HttpOnly para segurança contra XSS
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000, // 1 hora
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/'
      });

      return res.status(200).json({ user: result.user });

    } catch (error: any) {
      if (error.message === "Invalid email or password") {
        return res.status(401).json({ message: "Invalid Credentials." });
      }
      console.error(error);
      return res.status(500).json({ message: "An unexpected server error occurred." });
    }
  },

  logout: async (req: Request, res: Response) => {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    });
    return res.status(200).json({ message: "Logout realizado com sucesso." });
  },

  getProfile: async (req: Request, res: Response) => {
    // O req.user é populado pelo authMiddleware
    return res.status(200).json(req.user);
  },

  forgotPassword: async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        // Resposta genérica por segurança (User Enumeration protection)
        return res.status(200).json({ message: "Se o e-mail estiver cadastrado, um link de recuperação será enviado." });
      }

      // 1. Geração de Token temporário de 1 hora
      const token = crypto.randomBytes(20).toString('hex');
      const expires = new Date(Date.now() + 3600000); 

      await prisma.user.update({
        where: { email },
        data: {
          resetToken: token,
          resetTokenExpires: expires
        }
      });

      // 2. Envio do link para o Frontend
      const resetLink = `https://agrandefamilia.vercel.app/reset-password?token=${token}`;
      await emailService.sendResetPasswordEmail(email, resetLink);

      return res.status(200).json({ message: "Link de recuperação enviado com sucesso." });

    } catch (error) {
      console.error("Erro no forgotPassword:", error);
      return res.status(500).json({ message: "Erro ao processar solicitação de senha." });
    }
  },

  resetPassword: async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    try {
      // 1. Validação de força da nova senha
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ 
          message: "A nova senha deve ter pelo menos 6 caracteres e um símbolo especial." 
        });
      }

      // 2. Busca usuário com token válido e dentro do prazo (gt = maior que agora)
      const user = await prisma.user.findFirst({
        where: {
          resetToken: token,
          resetTokenExpires: { gt: new Date() }
        }
      });

      if (!user) {
        return res.status(400).json({ message: "Token inválido ou expirado." });
      }

      // 3. Hash da nova senha e limpeza do token
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpires: null
        }
      });

      return res.status(200).json({ message: "Senha alterada com sucesso!" });

    } catch (error) {
      console.error("Erro no resetPassword:", error);
      return res.status(500).json({ message: "Erro ao redefinir a senha." });
    }
  }
};