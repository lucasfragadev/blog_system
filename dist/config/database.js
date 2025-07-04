"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose")); // Importando o "tradutor" do MongoDB, o mongoose.
const connectDB = async () => {
    try {
        const mongoURI = 'mongodb://localhost:27017/blog_api';
        await mongoose_1.default.connect(mongoURI);
        console.log('MongoDB conectado com sucesso!');
    }
    catch (error) {
        console.error('Erro ao conectar ao MMongoDB:', error);
        process.exit(1); // Se falhar, a aplicação é interrompida.
    }
};
exports.default = connectDB;
