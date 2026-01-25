import { Router } from 'express';
import { postController } from '../controllers/PostController';
import { authMiddleware } from '../middlewares/authMiddleware';

const postRoutes = Router();

// --- PUBLIC Routes for Posts ---
postRoutes.get('/', postController.getAll);
postRoutes.get('/:id', postController.getById);

// --- PRIVATE Routes for Posts ---
// The authMiddleware is applied individually here.
postRoutes.post('/', authMiddleware, postController.create);
postRoutes.put('/:id', authMiddleware, postController.update);
postRoutes.delete('/:id', authMiddleware, postController.delete);

export default postRoutes;