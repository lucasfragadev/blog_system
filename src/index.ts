import express from 'express'; // Import Express.
import routes from './routes'; // Import the main server.
import connectDB from './config/database';

const startServer = async () => {
  // Connect to the database and wait for the connection to be established
  await connectDB();
  
  const app = express(); 
  const PORT = 3000;
  
  app.use(routes); // Tells the application to use the router we imported
  
  app.listen(PORT, () => {
    console.log(`The server is running on PORT: ${PORT}!`)
    console.log(`Access directly at: http://localhost:${PORT}`)
  });
};

startServer();

