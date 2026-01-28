import { Request, Response } from 'express';
import { postService } from '../services/PostService';
import { prisma } from '../config/prisma';

export const postController = {
  
  create: async (req: Request, res: Response) => {
    const { title, content } = req.body;
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
      const currentUserId = req.user?.id; 

      const posts = await postService.findAll(currentUserId);
      
      const formattedPosts = posts.map((post: any) => ({
        ...post,
        // 1. Mapeamento explícito do contador para o Frontend
        likeCount: post._count?.likes || 0,
        commentCount: post._count?.comments || 0,
        // 2. Transformação do array de likes em booleano
        isLiked: post.likes ? post.likes.length > 0 : false,
        // 3. Limpeza de dados desnecessários no JSON
        likes: undefined,
        _count: undefined
      }));

      return res.status(200).json(formattedPosts);

    } catch (error) {
      console.error("Error fetching all posts:", error);
      return res.status(500).json({ message: "An unexpected server error occurred." });
    }
  },

  getById: async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const currentUserId = req.user?.id;
      const post = await postService.getPostById(id, currentUserId);

      if (!post) {
        return res.status(404).json({ message: 'Post not found.' });
      }

      const formattedPost = {
        ...post,
        likeCount: post._count?.likes || 0,
        commentCount: post._count?.comments || 0,
        isLiked: post.likes ? post.likes.length > 0 : false,
        likes: undefined,
        _count: undefined
      };

      return res.status(200).json(formattedPost);

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

      const updatedPost = await postService.updatePost(id, authorId, { title, content });
      return res.status(200).json(updatedPost);

    } catch (error: any) {
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
      
      const requestingUser = await prisma.user.findUnique({ 
        where: { id: userId },
        select: { role: true } 
      });

      const isOwner = post.authorId === userId;
      const isAdmin = requestingUser?.role === 'ADMIN';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "Unauthorized action." });
      }

      await prisma.post.delete({ where: { id } });

      return res.status(204).send();

    } catch (error: any) {
      console.error("Erro ao deletar post:", error);
      return res.status(500).json({ message: "An unexpected error has occurred." });
    }
  }
};