import { Router } from 'express';
import { postController } from '../controllers/PostController';
import { authMiddleware } from '../middlewares/authMiddleware';

const postRoutes = Router();

// --- Rotas Públicas (Leitura) ---
// O Controller verifica opcionalmente o token para funcionalidades como "IsLiked",
// mas o acesso é permitido a visitantes.
postRoutes.get('/', postController.getAll);
postRoutes.get('/:id', postController.getById);

// --- Rotas Protegidas (Escrita) ---
// Middleware aplicado individualmente para garantir segurança em operações críticas.
postRoutes.post('/', authMiddleware, postController.create);
postRoutes.put('/:id', authMiddleware, postController.update);
postRoutes.delete('/:id', authMiddleware, postController.delete);

export default postRoutes;