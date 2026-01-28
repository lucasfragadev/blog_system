import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
import routes from './routes/index';
import { prisma } from './config/prisma';
import { swaggerDocument } from './config/swagger';

dotenv.config();

const app = express(); 

app.use(express.json()); 
app.use(cookieParser()); 

// Configuração de CORS
const allowedOrigins = [
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  process.env.FRONTEND_URL 
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// ROTA RAIZ (Para testar se o backend está vivo)
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Welcome to the Blog API!',
    documentation: '/api-docs'
  });
});

// CONFIGURAÇÃO DO SWAGGER (Mantenha sem o prefixo /api/v1 para ser acessível em /api-docs)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }', // Remove a barra preta (opcional)
  swaggerOptions: {
    persistAuthorization: true,
  },
}));

// ROTAS DA API
app.use('/api/v1', routes);

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  prisma.$connect()
    .then(() => {
      console.log('✅ [INFO] Database connected');
      app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));
    });
}

export default app;