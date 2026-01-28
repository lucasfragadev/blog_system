import { Router } from 'express';
import { postController } from '../controllers/PostController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { optionalAuth } from '../middlewares/optionalAuth'; // Importe o novo middleware

const postRoutes = Router();

// --- Rotas Públicas (Leitura) ---
postRoutes.get('/', optionalAuth, postController.getAll);
postRoutes.get('/:id', optionalAuth, postController.getById);

// --- Rotas Protegidas (Escrita) ---
postRoutes.post('/', authMiddleware, postController.create);
postRoutes.put('/:id', authMiddleware, postController.update);
postRoutes.delete('/:id', authMiddleware, postController.delete);

export default postRoutes;