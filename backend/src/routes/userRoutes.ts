import { Router } from 'express';
import { userController } from '../controllers/UserController';
import { authMiddleware } from '../middlewares/authMiddleware';

const userRoutes = Router();

// Convenção REST: '/me' retorna o recurso do próprio usuário autenticado.
// O AuthMiddleware injeta o req.user.id, que o controller utiliza.
userRoutes.get('/me', authMiddleware, userController.getProfile);

export default userRoutes;