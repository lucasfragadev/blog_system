import { Router } from 'express';
import { welcomeController } from '../controllers/welcomeController';
import authRoutes from './authRoutes';
import postRoutes from './postRoutes';
import userRoutes from './userRoutes';

const router = Router();

// Grouping routes by resource, each with its own prefix.
router.use('/auth', authRoutes);  // -> /api/v1/auth/register, /api/v1/auth/login
router.use('/posts', postRoutes); // -> /api/v1/posts, /api/v1/posts/:id
router.use('/users', userRoutes); // -> /api/v1/users/me

export default router;