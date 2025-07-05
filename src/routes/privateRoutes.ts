import { Router } from 'express';
import { userController } from '../controllers/UserController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { postController } from '../controllers/PostController';

const privateRoutes = Router();

privateRoutes.use(authMiddleware);

// Rotas que precisam de autenticação
privateRoutes.get('/profile', userController.getProfile);
privateRoutes.post('/posts', postController.create);
privateRoutes.put('/posts/:id', postController.update);

export default privateRoutes;