"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = void 0;
const User_1 = __importDefault(require("../models/User"));
exports.userRepository = {
    /**
     * @description Creates a new user in the database.
     * @param userData - The user data to be created.
     * @returns The newly created user.
     */
    create: async (userData) => {
        try {
            const newUser = await User_1.default.create(userData);
            return newUser;
        }
        catch (error) {
            console.error("Erro ao criar usuário no repositório:", error);
            throw error; // This is used to throw the error so that the service layer can capture it.;
        }
    },
};
