"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserController_1 = require("../controllers/UserController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const PostController_1 = require("../controllers/PostController");
const privateRoutes = (0, express_1.Router)();
privateRoutes.use(authMiddleware_1.authMiddleware);
// Rotas que precisam de autenticação
privateRoutes.get('/profile', UserController_1.userController.getProfile);
privateRoutes.post('/posts', PostController_1.postController.create);
privateRoutes.put('/posts/:id', PostController_1.postController.update);
privateRoutes.delete('/posts/:id', PostController_1.postController.delete);
exports.default = privateRoutes;
