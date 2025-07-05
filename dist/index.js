"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express")); // Import Express.
const routes_1 = __importDefault(require("./routes")); // Import the main server.
const database_1 = __importDefault(require("./config/database"));
const startServer = async () => {
    // Connect to the database and wait for the connection to be established.
    await (0, database_1.default)();
    const app = (0, express_1.default)();
    const PORT = 3000;
    app.use(express_1.default.json()); // Middleware to teach Express to read the request body in JSON.
    app.use(routes_1.default); // Tells the application to use the router we imported.
    app.listen(PORT, () => {
        console.log(`The server is running on PORT: ${PORT}!`);
        console.log(`Access directly at: http://localhost:${PORT}`);
    });
};
startServer();
