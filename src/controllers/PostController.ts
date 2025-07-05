import { Request, Response } from 'express';
import { postService } from '../services/PostService';
import { AuthRequest } from '../middlewares/authMiddleware';

export const postController = {
  create: async (req: AuthRequest, res: Response) => {
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
      const posts = await postService.findAll();

      return res.status(200).json(posts)

    } catch (error) {
      return res.status(500).json({ message: "An unexpected server error occurred." });
    }
  }
}