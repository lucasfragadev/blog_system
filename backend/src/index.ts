import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import routes from './routes/index';
import { prisma } from './config/prisma';
import YAML from 'yamljs';
import cookieParser from 'cookie-parser';

dotenv.config();

const startServer = async () => {
  // Conexão com Banco de Dados
  try {
    await prisma.$connect();
    console.log('✅ [INFO] Database connected via Prisma');
  } catch (error) {
    console.error('❌ [ERROR] Database connection failed:', error);
    process.exit(1); // Encerra o processo se o banco não subir (Fail Fast)
  }
  
  const app = express(); 
  const PORT = process.env.PORT || 3000;

  // Carrega documentação OpenAPI/Swagger
  const swaggerDocument = YAML.load('./openapi.yaml');

  // Middlewares Globais
  app.use(express.json()); // Parser de JSON no body
  app.use(cookieParser()); // Parser de Cookies nos headers (Essencial para Auth HttpOnly)
  
  // Configuração de CORS (Cross-Origin Resource Sharing)
  app.use(cors({
    origin: [
      'http://localhost:3001',      // Frontend Web Desktop
      'http://192.168.1.15:3001',   // Frontend via IP (Celular/Rede Local)
      'http://127.0.0.1:3001',
    ],
    credentials: true, // Permite o tráfego de Cookies e Headers de Autorização entre origens
  }));
  
  // Health Check
  app.get('/', (req, res) => {
    res.json({
      status: 'online',
      message: 'Welcome to the Blog API!',
      documentation: `http://localhost:${PORT}/api-docs`
    });
  });
  
  // Rota de Documentação
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  
  // Prefixo Global da API (Versioning)
  app.use('/api/v1', routes);

  app.listen(PORT, () => {
    console.log(`🚀 Server running on PORT: ${PORT}`);
    console.log(`📡 Local Access: http://localhost:${PORT}`);
    console.log(`📄 Docs: http://localhost:${PORT}/api-docs`);
  });
};

startServer();