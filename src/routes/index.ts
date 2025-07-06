import { Router } from 'express';
import { welcomeController } from '../controllers/welcomeController';
import publicRoutes from './publicRoutes';
import privateRoutes from './privateRoutes';

const router = Router();

// Welcome route
router.get('/', welcomeController.getWelcomeMessage);

router.use(publicRoutes);  
router.use(privateRoutes);

export default router;