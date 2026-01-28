import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { Prisma } from '@prisma/client';

const userService = new UserService();

export const userController = {
  
  create: async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    try {
      if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email, and password are required." });
      }

      const newUser = await userService.register({ name, email, password });
      return res.status(201).json(newUser);

    } catch (error: any) {
      // Tratamento específico para violação de chave única (Email duplicado) no Prisma
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
           return res.status(409).json({ message: "This email is already registered." });
        }
      }
      // Fallback para caso o erro venha do Service com essa mensagem
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

      // Definição do Cookie HttpOnly (Segurança Crítica)
      // O token fica invisível para o JavaScript do Frontend (proteção contra XSS)
      res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000, 
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
    // Para limpar o cookie, as opções (path, secure, etc) devem ser IDÊNTICAS às da criação
    res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/'
  });
    return res.status(200).json({ message: "Logout realizado com sucesso." });
  },

  getProfile: async (req: Request, res: Response) => {
    // Retorna os dados populados pelo AuthMiddleware, sem precisar ir ao banco novamente
    return res.status(200).json(req.user);
  }
};