import { Router } from 'express';
import { userController } from '../controllers/UserController';
import { authMiddleware } from '../middlewares/authMiddleware';

const userRoutes = Router();

// Route for the logged-in user to fetch their own profile.
// Using '/me' is a common REST convention for "the authenticated user's resource".
// We protect the route individually with the middleware.
userRoutes.get('/me', authMiddleware, userController.getProfile);

export default userRoutes;