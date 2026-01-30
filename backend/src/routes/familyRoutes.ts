import { Router } from 'express';
import { familyController } from '../controllers/FamilyController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';

const familyRoutes = Router();

// Apenas ADMIN pode ver a lista bruta de membros e realizar conexões
familyRoutes.get('/members', authMiddleware, adminMiddleware, familyController.index);
familyRoutes.post('/link', authMiddleware, adminMiddleware, familyController.link);

export default familyRoutes;