import { Router } from 'express';
import { userController } from '../controllers/UserController';

const authRoutes = Router();

// The route to publicly create a user is a form of "registration"
authRoutes.post('/register', userController.create);

// The route to authenticate
authRoutes.post('/login', userController.authenticate);

export default authRoutes;