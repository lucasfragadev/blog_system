import dotenv from 'dotenv';
dotenv.config();

import express from 'express'; // Import Express.
import routes from './routes'; // Import the main server.
import connectDB from './config/database';
import cors from 'cors';

import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const startServer = async () => {
  // Connect to the database and wait for the connection to be established.
  await connectDB();
  
  const app = express(); 
  const PORT = 3000;
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