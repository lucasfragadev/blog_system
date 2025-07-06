import { Router } from 'express';
import { userController } from '../controllers/UserController';
import { postController } from '../controllers/PostController';

const publicRoutes = Router();

// Routes that do not require authentication
publicRoutes.post('/users', userController.create);
publicRoutes.post('/login', userController.authenticate);
publicRoutes.get('/posts', postController.getAll);
publicRoutes.get('/posts/:id', postController.getById);

export default publicRoutes;