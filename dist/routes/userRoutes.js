"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/userRoutes.ts
const express_1 = require("express"); // Importe Router
const UserController_1 = require("../controllers/UserController");
// Criamos um roteador específico para as rotas de usuário
// Adicionamos a tipagem explícita para IRouter para ajudar o TypeScript
const userRoutes = (0, express_1.Router)();
// Mapeamos o método POST na rota /users para a função create do nosso controller
userRoutes.post('/users', UserController_1.userController.create);
userRoutes.post('/login', UserController_1.userController.authenticate);
// Exportamos o roteador configurado como o default deste módulo
exports.default = userRoutes;
