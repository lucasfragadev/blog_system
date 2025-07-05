"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Access Denied. Token not provided.' });
    }
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ message: 'Token format error.' });
    }
    const token = parts[1];
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('The JWT secret key was not configured in the environment.');
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        req.user = decoded;
        return next();
    }
    catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};
exports.authMiddleware = authMiddleware;
