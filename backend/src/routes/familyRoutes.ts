import { Router } from 'express';
import { familyController } from '../controllers/FamilyController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';

const familyRoutes = Router();

// Rota pública para todos os logados verem a árvore
familyRoutes.get('/tree', authMiddleware, familyController.getTree);

// Rotas restritas ao ADMIN para gestão
familyRoutes.get('/members', authMiddleware, adminMiddleware, familyController.index);
familyRoutes.post('/link', authMiddleware, adminMiddleware, familyController.link);

export default familyRoutes;