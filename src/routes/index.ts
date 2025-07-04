import { Router } from 'express';
import { welcomeController } from '../controllers/welcomeController';
import userRoutes from './userRoutes'; // Importa o ROTEADOR de usuários

const router = Router();

// Rota de boas-vindas
router.get('/', welcomeController.getWelcomeMessage);

// Aqui, dizemos ao roteador principal para USAR o conjunto de rotas de usuário.
// O .use() é para plugar módulos de rotas ou middlewares.
router.use(userRoutes);

export default router;