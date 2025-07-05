"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserController_1 = require("../controllers/UserController");
const PostController_1 = require("../controllers/PostController");
const publicRoutes = (0, express_1.Router)();
// Rotas que não precisam de autenticação
publicRoutes.post('/users', UserController_1.userController.create);
publicRoutes.post('/login', UserController_1.userController.authenticate);
publicRoutes.get('/posts', PostController_1.postController.getAll);
exports.default = publicRoutes;
