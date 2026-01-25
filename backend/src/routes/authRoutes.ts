import { Router } from 'express';
import { userController } from '../controllers/UserController';

const authRoutes = Router();

authRoutes.post('/register', userController.create);
authRoutes.post('/login', userController.authenticate);
authRoutes.post('/logout', userController.logout);

export default authRoutes;