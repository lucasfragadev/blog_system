"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express"); // Import Router from Express.
const welcomeController_1 = require("../controllers/welcomeController"); // Import controller.
const router = (0, express_1.Router)(); // Creates a router instance.
router.get('/', welcomeController_1.welcomeController.getWelcomeMessage);
exports.default = router;
