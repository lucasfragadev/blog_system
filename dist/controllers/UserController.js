"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const UserService_1 = require("../services/UserService");
exports.userController = {
    create: async (req, res) => {
        const { name, email, password } = req.body;
        try {
            // Check if name, email, and password are provided
            if (!name || !email || !password) {
                return res.status(400).json({ message: "Name, email, and password are required." });
            }
            const newUser = await UserService_1.userService.create({ name, email, password });
            // Return the newly created user
            return res.status(201).json(newUser);
        }
        catch (error) {
            // Handle duplicate email error
            if (error.code === 11000) {
                return res.status(409).json({ message: "This email is already registered." });
            }
            // Log other unexpected errors
            console.error(error);
            // Return a generic server error message
            return res.status(500).json({ message: "An unexpected server error occurred." });
        }
    },
    authenticate: async (req, res) => {
        const { email, password } = req.body;
        try {
            // Check if email and password are provided
            if (!email || !password) {
                return res.status(400).json({ message: "Email and password are required." });
            }
            const user = await UserService_1.userService.authenticate(email, password);
            // Return the authenticated user
            return res.status(200).json(user);
        }
        catch (error) {
            // Handle invalid credentials error
            if (error.message === "Invalid Credentials.") { // This message is part of the error handling logic, not a comment to be translated.
                return res.status(401).json({ message: error.message });
            }
            // Log other unexpected errors
            console.error(error);
            // Return a generic server error message
            return res.status(500).json({ message: "An unexpected server error occurred." });
        }
    },
};
