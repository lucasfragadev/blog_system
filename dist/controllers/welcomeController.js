"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.welcomeController = void 0;
exports.welcomeController = {
    /**
     * @description Handles the request to the root endpoint and sends a welcome message.
     * @param { Request } req - The request object from Express.
     * @param { Response } res - The response object from Express.
     */
    getWelcomeMessage: (req, res) => {
        res.json({ message: "Bem vindo à API Blog!" });
    }
};
