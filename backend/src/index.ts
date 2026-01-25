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
  try {
    await prisma.$connect();
    console.log('✅ [INFO] Database (Postgres) connected successfully via Prisma');
  } catch (error) {
    console.error('❌ [ERROR] Failed to connect to database:', error);
    process.exit(1); // Encerra se não conseguir conectar
  }
  
  const app = express(); 
  const PORT = 3000;

  const swaggerDocument = YAML.load('./openapi.yaml');

  app.use(express.json());
  app.use(cookieParser());
  
  app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true,
  }));
  
  app.get('/', (req, res) => {
    res.json({
      status: 'online',
      message: 'Welcome to the Blog API!',
      documentation: `http://localhost:${PORT}/api-docs`
    });
  });
  
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  
  app.use('/api/v1', routes); // Tells the application to use the router we imported.

  app.listen(PORT, () => {
    console.log(`The server is running on PORT: ${PORT}!`)
    console.log(`Access directly at: http://localhost:${PORT}`)
    console.log(`Access API Documentation http://localhost:${PORT}/api-docs`)
  });
};

startServer();