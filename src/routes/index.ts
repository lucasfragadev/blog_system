import { Router } from 'express';
import { welcomeController } from '../controllers/welcomeController';
import publicRoutes from './publicRoutes';
import privateRoutes from './privateRoutes';

const router = Router();

// Rota de boas-vindas
router.get('/', welcomeController.getWelcomeMessage);

router.use(publicRoutes);  
router.use(privateRoutes);

export default router;