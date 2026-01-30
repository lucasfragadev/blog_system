import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { emailService } from '../services/EmailService';
import crypto from 'node:crypto';
import bcrypt from 'bcrypt';

const userService = new UserService();

// Regex: Mínimo 6 caracteres e ao menos 1 símbolo especial
const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/;

export const userController = {

  create: async (req: Request, res: Response) => {
    // Destruturando novos campos
    const { name, email, password, confirmPassword, birthDate, gender } = req.body;

    if (!name || !email || !password || !confirmPassword || !gender) {
      return res.status(400).json({ message: "Nome, e-mail, senha, confirmação e gênero são obrigatórios." });
    }

    // Validação do Enum de Gênero
    const validGenders = ['MASCULINO', 'FEMININO', 'OUTRO'];
    if (!validGenders.includes(gender)) {
      return res.status(400).json({ message: "Gênero selecionado é inválido." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "As senhas não coincidem." });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "A senha deve ter pelo menos 6 caracteres e um símbolo especial."
      });
    }

    try {
      // Passando novos dados para o service
      const newUser = await userService.register({ name, email, password, birthDate, gender });

      try {
        await emailService.sendWelcomeEmail(email, name);
      } catch (err) {
        console.error("Falha ao enviar e-mail de boas-vindas:", err);
      }
      return res.status(201).json(newUser);

    } catch(error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return res.status(409).json({ message: "Este e-mail já está cadastrado." });
      }
      console.error(error);
      return res.status(500).json({ message: "Erro inesperado ao registrar usuário." });
    }
  },

  authenticate: async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
      if (!email || !password) {
        return res.status(400).json({ message: "E-mail e senha são obrigatórios." });
      }

      const result = await userService.login({ email, password });

      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000, 
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/'
      });

      return res.status(200).json({ user: result.user });

    } catch (error: any) {
      const authErrors = [
        "E-mail ou senha incorretos.",
        "E-mail ou senha inválidos.",
        "Invalid credentials",
        "User already exists"
      ];

      if (authErrors.includes(error.message)) {
        return res.status(401).json({ message: "E-mail ou senha incorretos." });
      }

      console.error("Erro interno no Login:", error);
      return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
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
    return res.status(200).json(req.user);
  },

  forgotPassword: async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return res.status(200).json({ message: "Se o e-mail estiver cadastrado, um link de recuperação será enviado." });
      }

      const token = crypto.randomBytes(20).toString('hex');
      const expires = new Date(Date.now() + 3600000);

      await prisma.user.update({
        where: { email },
        data: {
          resetToken: token,
          resetTokenExpires: expires
        }
      });

      const resetLink = `https://agrandefamilia.vercel.app/reset-password?token=${token}`;
      await emailService.sendResetPasswordEmail(email, resetLink);

      return res.status(200).json({ message: "Link de recuperação enviado com sucesso." });

    } catch (error) {
      console.error("Erro no forgotPassword:", error);
      return res.status(500).json({ message: "Erro ao processar solicitação de senha." });
    }
  },

  resetPassword: async (req: Request, res: Response) => {
    const { token, newPassword, confirmPassword } = req.body;

    try {
      if (!newPassword || !confirmPassword) {
        return res.status(400).json({ message: "Senha e confirmação são obrigatórias." });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "As senhas não coincidem." });
      }

      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
          message: "A nova senha deve ter pelo menos 6 caracteres e um símbolo especial."
        });
      }

      const user = await prisma.user.findFirst({
        where: {
          resetToken: token,
          resetTokenExpires: { gt: new Date() }
        }
      });

      if (!user) {
        return res.status(400).json({ message: "Token inválido ou expirado." });
      }

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