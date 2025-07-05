"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const welcomeController_1 = require("../controllers/welcomeController");
const publicRoutes_1 = __importDefault(require("./publicRoutes"));
const privateRoutes_1 = __importDefault(require("./privateRoutes"));
const router = (0, express_1.Router)();
// Rota de boas-vindas
router.get('/', welcomeController_1.welcomeController.getWelcomeMessage);
router.use(publicRoutes_1.default);
router.use(privateRoutes_1.default);
exports.default = router;
