import { Router } from 'express';
import authRoutes from './authRoutes';
import postRoutes from './postRoutes';
import userRoutes from './userRoutes';
import commentRoutes from './commentRoutes';
import likeRoutes from './likeRoutes';

const router = Router();

// Hub central de rotas da API (v1)
// Aqui definimos os prefixos para cada módulo. Ex: tudo de user será /users/...
router.use('/auth', authRoutes); 
router.use('/posts', postRoutes); 
router.use('/users', userRoutes); 
router.use('/comments', commentRoutes); 
router.use('/likes', likeRoutes);

export default router;