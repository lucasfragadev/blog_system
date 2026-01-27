import { Request, Response } from 'express';
import { postService } from '../services/PostService';
import { prisma } from '../config/prisma';
import jwt from 'jsonwebtoken';

/**
 * Helper: Extrai o ID do usuário manualmente do Token.
 * Motivo: As rotas `getAll` e `getById` são públicas (sem AuthMiddleware obrigatório),
 * mas precisamos identificar o usuário (se logado) para verificar se ele deu Like nos posts.
 */
const getUserIdFromToken = (req: Request): string | undefined => {
  try {
    const token = req.cookies.token; 
    if (!token) return undefined;

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    return decoded.id;
  } catch (error) {
    // Silencia o erro pois o token pode ser inválido/expirado e a rota é pública
    return undefined;
  }
};

export const postController = {
  
  create: async (req: Request, res: Response) => {
    const { title, content } = req.body;
    // O req.user é populado pelo AuthMiddleware nas rotas protegidas
    const authorId = req.user?.id;

    try {
      if (!title || !content || !authorId) {
        return res.status(400).json({ message: "Title, author and content are required." });
      }

      const newPost = await postService.create({ title, content, authorId });
      return res.status(201).json(newPost);

    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ message: 'An unexpected server error occurred.' });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      // Passamos o ID (se existir) para o Service calcular o campo 'isLiked' e 'likeCount'
      const currentUserId = getUserIdFromToken(req); 

      const posts = await postService.findAll(currentUserId);
      return res.status(200).json(posts);

    } catch (error) {
      console.error("Error fetching all posts:", error);
      return res.status(500).json({ message: "An unexpected server error occurred." });
    }
  },

  getById: async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      // Mesma lógica do getAll: identifica o usuário para verificar status de like no post único
      const currentUserId = getUserIdFromToken(req);

      const post = await postService.getPostById(id, currentUserId);
      return res.status(200).json(post);

    } catch (error: any) {
      if (error.message === 'Post not found.') {
        return res.status(404).json({ message: error.message });
      }
      console.error("Error fetching post by ID:", error);
      return res.status(500).json({ message: "An unexpected server error occurred." });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const authorId = req.user?.id;
      const { title, content } = req.body;

      if (!authorId) {
        return res.status(403).json({ message: "Unauthorized action." });
      }

      // A validação se o usuário é o dono é feita dentro do Service
      const updatedPost = await postService.updatePost(id, authorId, { title, content });
      return res.status(200).json(updatedPost);

    } catch (error: any) {
      // Tratamento de erros específicos do Service para retornar o status HTTP correto
      if (error.message === 'Post not found.') return res.status(404).json({ message: error.message });
      if (error.message === 'Unauthorized action.') return res.status(403).json({ message: error.message });

      console.error("Erro ao atualizar post:", error);
      return res.status(500).json({ message: "An unexpected error has occurred." });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(403).json({ message: "Unauthorized action." });
      }

      const post = await prisma.post.findUnique({ where: { id } });
      if (!post) {
        return res.status(404).json({ message: "Post not found." });
      }
      
      // Busca a role do usuário logado para permitir moderação por Admin
      const requestingUser = await prisma.user.findUnique({ 
        where: { id: userId },
        select: { role: true } 
      });

      // Lógica de Permissão Híbrida:
      // 1. Ownership: O autor do post pode deletar.
      // 2. RBAC: Um ADMIN pode deletar qualquer post.
      const isOwner = post.authorId === userId;
      const isAdmin = requestingUser?.role === 'ADMIN';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "Unauthorized action." });
      }

      await prisma.post.delete({ where: { id } });

      return res.status(204).send();

    } catch (error: any) {
      if (error.message === 'Post not found.') return res.status(404).json({ message: error.message });
      if (error.message === 'Unauthorized action.') return res.status(403).json({ message: error.message });
      
      console.error("Erro ao deletar post:", error);
      return res.status(500).json({ message: "An unexpected error has occurred." });
    }
  }
};