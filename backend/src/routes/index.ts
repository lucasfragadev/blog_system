import { Router } from 'express';
import authRoutes from './authRoutes';
import postRoutes from './postRoutes';
import userRoutes from './userRoutes';
import commentRoutes from './commentRoutes';
import likeRoutes from './likeRoutes';
import familyRoutes from './familyRoutes';

const router = Router();

// Hub central de rotas da API (v1)
router.use('/auth', authRoutes); 
router.use('/posts', postRoutes); 
router.use('/users', userRoutes); 
router.use('/comments', commentRoutes); 
router.use('/likes', likeRoutes);
router.use('/family', familyRoutes); // 2. E esta linha aqui!

export default router;