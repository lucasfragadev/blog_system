import { Router } from 'express';
import authRoutes from './authRoutes';
import postRoutes from './postRoutes';
import userRoutes from './userRoutes';
import commentRoutes from './commentRoutes';

const router = Router();

// Grouping routes by resource, each with its own prefix.
router.use('/auth', authRoutes);  // -> /api/v1/auth/register, /api/v1/auth/login
router.use('/posts', postRoutes); // -> /api/v1/posts, /api/v1/posts/:id
router.use('/users', userRoutes); // -> /api/v1/users/me
router.use('/comments', commentRoutes); // -> /api/v1/comments, /api/v1/comments/:id

export default router;