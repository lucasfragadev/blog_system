import { Request, Response } from 'express';
import { CommentService } from '../services/CommentService';

const commentService = new CommentService();

export const commentController = {
  
  create: async (req: Request, res: Response) => {
    try {
      const { content, postId } = req.body;
      // O req.user é populado pelo authMiddleware após a validação do token JWT
      const authorId = req.user?.id; 

      if (!authorId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const comment = await commentService.createComment(content, authorId, postId);
      return res.status(201).json(comment);

    } catch (error: any) {
      return res.status(500).json({ message: error.message || "Internal Error" });
    }
  },

  listByPost: async (req: Request, res: Response) => {
    try {
      const { postId } = req.params;
      const comments = await commentService.getCommentsByPost(postId);
      return res.status(200).json(comments);

    } catch (error: any) {
      console.error('Error listing comments:', error);
      
      return res.status(500).json({ 
        message: error.message || "Internal Error",
        // Retorna o stack trace apenas em desenvolvimento para facilitar o debug
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      });
    }
  }
};