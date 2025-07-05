// src/routes/userRoutes.ts
import { Router } from 'express'; // Importe Router
import { userController } from '../controllers/UserController';

// Criamos um roteador específico para as rotas de usuário
// Adicionamos a tipagem explícita para IRouter para ajudar o TypeScript
const userRoutes = Router();

// Mapeamos o método POST na rota /users para a função create do nosso controller
userRoutes.post('/users', userController.create);
userRoutes.post('/login', userController.authenticate);

// Exportamos o roteador configurado como o default deste módulo
export default userRoutes;