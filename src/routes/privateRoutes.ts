import { Router } from 'express';
import { userController } from '../controllers/UserController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { postController } from '../controllers/PostController';

const privateRoutes = Router();

privateRoutes.use(authMiddleware);

// Routes that require authentication
privateRoutes.get('/profile', userController.getProfile);
privateRoutes.post('/posts', postController.create);
privateRoutes.put('/posts/:id', postController.update);
privateRoutes.delete('/posts/:id', postController.delete);

export default privateRoutes;