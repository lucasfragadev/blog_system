import { Router } from 'express';
import { userController } from '../controllers/UserController';

const authRoutes = Router();

// Rotas Públicas de Autenticação
// Não usamos AuthMiddleware aqui pois o usuário ainda não possui o token.
authRoutes.post('/register', userController.create);
authRoutes.post('/login', userController.authenticate);
authRoutes.post('/logout', userController.logout);
authRoutes.post('/forgot-password', userController.forgotPassword);
authRoutes.post('/reset-password', userController.resetPassword);

export default authRoutes;