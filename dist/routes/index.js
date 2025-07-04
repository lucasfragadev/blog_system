"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const welcomeController_1 = require("../controllers/welcomeController");
const userRoutes_1 = __importDefault(require("./userRoutes")); // Importa o ROTEADOR de usuários
const router = (0, express_1.Router)();
// Rota de boas-vindas
router.get('/', welcomeController_1.welcomeController.getWelcomeMessage);
// Aqui, dizemos ao roteador principal para USAR o conjunto de rotas de usuário.
// O .use() é para plugar módulos de rotas ou middlewares.
router.use(userRoutes_1.default);
exports.default = router;
