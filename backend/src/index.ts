import express from 'express'; // Import Express.
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import routes from './routes'; // Import the main server.
import { prisma } from './config/prisma';


import YAML from 'yamljs';

dotenv.config();

const startServer = async () => {
  // --- MUDANÇA AQUI ---
  // Removemos o 'await connectDB()' pois ele usava Mongoose.
  // Adicionamos a verificação de conexão do Prisma:
  try {
    await prisma.$connect();
    console.log('✅ [INFO] Database (Postgres) connected successfully via Prisma');
  } catch (error) {
    console.error('❌ [ERROR] Failed to connect to database:', error);
    process.exit(1); // Encerra se não conseguir conectar
  }
  // --------------------
  
  const app = express(); 
  const PORT = 3000;

  // Carrega o YAML conforme sua configuração atual
  // Certifique-se que o arquivo 'openapi.yaml' existe na raiz
  const swaggerDocument = YAML.load('./openapi.yaml');

  app.use(express.json()); // Middleware to teach Express to read the request body in JSON.
  app.use(cors());
  
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