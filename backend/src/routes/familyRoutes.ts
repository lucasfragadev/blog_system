import { Router } from 'express';
import { familyController } from '../controllers/FamilyController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';

const familyRoutes = Router();

// Rota para a Árvore Visual (Todos os logados)
familyRoutes.get('/tree', authMiddleware, familyController.getTree);

// Rotas de Gestão (Apenas ADMIN)
familyRoutes.get('/members', authMiddleware, adminMiddleware, familyController.index);
familyRoutes.post('/link', authMiddleware, adminMiddleware, familyController.link);
familyRoutes.post('/manual', authMiddleware, adminMiddleware, familyController.createManual);

export default familyRoutes;