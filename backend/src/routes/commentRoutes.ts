import { Router } from 'express';
import { commentController } from '../controllers/CommentController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Rota Protegida: Criar comentário exige identificação do autor (Token)
router.post('/', authMiddleware, commentController.create);

// Rota Pública: Listar comentários deve ser acessível a todos
router.get('/post/:postId', commentController.listByPost);

export default router;