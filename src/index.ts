import dotenv from 'dotenv';
dotenv.config();

import express from 'express'; // Import Express.
import routes from './routes'; // Import the main server.
import connectDB from './config/database';
import cors from 'cors';

import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swaggerConfig';


const startServer = async () => {
  // Connect to the database and wait for the connection to be established.
  await connectDB();
  
  const app = express(); 
  const PORT = 3000;

  app.use(express.json()); // Middleware to teach Express to read the request body in JSON.
  app.use(cors());
  
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  app.use(routes); // Tells the application to use the router we imported.
    
  app.listen(PORT, () => {
    console.log(`The server is running on PORT: ${PORT}!`)
    console.log(`Access directly at: http://localhost:${PORT}`)
  });
};

startServer();

