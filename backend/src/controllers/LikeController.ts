import { Request, Response } from 'express';
import { LikeService } from '../services/LikeService';

const likeService = new LikeService();

export const likeController = {
  
  toggle: async (req: Request, res: Response) => {
    try {
      // O ID do post vem via parâmetro da rota (definido no arquivo de rotas como /:postId)
      const { postId } = req.params;
      
      // O req.user é injetado pelo AuthMiddleware após a validação do token JWT
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Chama o serviço que decide se cria (Like) ou remove (Dislike) o registro
      const result = await likeService.toggleLike(userId, postId);
      return res.status(200).json(result);

    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ message: "Internal Error" });
    }
  }
};