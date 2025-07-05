"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const UserRepository_1 = require("../repositories/UserRepository");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.userService = {
    /**
     * @description Handles the business logic for creating a new user.
     * @param userData - User data.
     * @returns The newly created user.
     */
    create: async (userData) => {
        try {
            // Definimos o "custo" do hash. 10 é um ótimo padrão de segurança.
            const saltRounds = 10;
            const hashedPassword = await bcryptjs_1.default.hash(userData.password, saltRounds);
            const newUserPayload = {
                name: userData.name,
                email: userData.email,
                password: hashedPassword,
            };
            // --- Here will be the business logic ---
            // For now, the service just forwards the call to the repository;
            const newUser = await UserRepository_1.userRepository.create(newUserPayload);
            return newUser;
        }
        catch (error) {
            // In this case, the service will capture the repository error (e.g. duplicate email, invalid password);
            // and will relaunch it so that the upper layer (Controller) can apply the appropriate treatment;
            throw error;
        }
    },
    authenticate: async (email, password) => {
        try {
            const user = await UserRepository_1.userRepository.findByEmail(email);
            if (!user) {
                throw new Error("Invalid Credentials.");
            }
            const isPasswordMatch = await bcryptjs_1.default.compare(password, user.password);
            if (!isPasswordMatch) {
                throw new Error("Invalid Credentials.");
            }
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                throw new Error('The JWT secret key is not configured. ');
            }
            const payload = {
                id: user._id,
                name: user.name
            };
            const token = jsonwebtoken_1.default.sign(payload, secret, { expiresIn: '8h' });
            return token;
        }
        catch (error) {
            throw error;
        }
    }
};
