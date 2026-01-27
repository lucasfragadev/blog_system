import { Router } from 'express';
import { likeController } from '../controllers/LikeController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Rota Protegida: Ação de 'Toggle' (Curtir/Descurtir) altera estado do banco
// e precisa do ID do usuário logado para criar a relação.
router.post('/post/:postId', authMiddleware, likeController.toggle);

export default router;