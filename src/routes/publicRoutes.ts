import { Router } from 'express';
import { userController } from '../controllers/UserController';
import { postController } from '../controllers/PostController';

const publicRoutes = Router();

// Rotas que não precisam de autenticação
publicRoutes.post('/users', userController.create);
publicRoutes.post('/login', userController.authenticate);
publicRoutes.get('/posts', postController.getAll);

export default publicRoutes;