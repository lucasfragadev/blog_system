"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const UserRepository_1 = require("../repositories/UserRepository");
exports.userService = {
    /**
     * @description Handles the business logic for creating a new user.
     * @param userData - User data.
     * @returns The newly created user.
     */
    create: async (userData) => {
        try {
            // --- Here will be the business logic ---
            // For now, the service just forwards the call to the repository;
            const newUser = await UserRepository_1.userRepository.create(userData);
            return newUser;
        }
        catch (error) {
            console.log("Erro ao criar o usuário.");
            // In this case, the service will capture the repository error (e.g. duplicate email, invalid password);
            // and will relaunch it so that the upper layer (Controller) can apply the appropriate treatment;
            throw error;
        }
    },
};
