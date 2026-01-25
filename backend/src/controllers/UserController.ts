import { Request, Response } from 'express';
import { UserService } from '../services/UserService'; // Importe a classe
import { Prisma } from '@prisma/client'; // Importante para tipar o erro

// Instanciamos o service
const userService = new UserService();

export const userController = {
  create: async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    try {
      if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email, and password are required." });
      }

      // Chama o método register (que criamos no passo anterior)
      const newUser = await userService.register({ name, email, password });

      return res.status(201).json(newUser);

    } catch (error: any) {
      // TRATAMENTO DE ERRO DO PRISMA (Postgres)
      // P2002 = Unique constraint failed (Violação de campo único, ex: email)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
           return res.status(409).json({ message: "This email is already registered." });
        }
      }

      // Se o Service lançar erro manual (ex: throw new Error('User already exists'))
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

      // Chama o método login (que criamos no passo anterior)
      const result = await userService.login({ email, password });

      // O Service retorna { user, token }, vamos devolver igual
      return res.status(200).json(result);

    } catch (error: any) {
      if (error.message === "Invalid email or password") {
        return res.status(401).json({ message: "Invalid Credentials." });
      }

      console.error(error);
      return res.status(500).json({ message: "An unexpected server error occurred." });
    }
  },

  // Esse aqui precisa de um ajuste para buscar do banco, 
  // pois o req.user só tem o que estava no token (ID e talvez Name)
  getProfile: async (req: Request, res: Response) => {
    // Como o authMiddleware injeta o user, podemos retornar direto ou buscar dados frescos
    return res.status(200).json(req.user);
  }
};