import { Router } from 'express';
import { userController } from '../controllers/UserController';

const publicRoutes = Router();

// Rotas que não precisam de autenticação
publicRoutes.post('/users', userController.create);
publicRoutes.post('/login', userController.authenticate);

export default publicRoutes;