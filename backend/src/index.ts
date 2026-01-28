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
  'http://192.168.1.15:3001',
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

// CONFIGURAÇÃO DO SWAGGER (Versão Anti-Tela-Branca para Vercel)
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css";
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customCssUrl: CSS_URL,
}));

// ROTA DE BOAS-VINDAS COM STATUS DO BANCO NEON
app.get('/', async (req, res) => {
  let dbStatus = 'offline';
  let dbVersion = 'N/A';

  try {
    // Verifica a conexão e pega a versão do PostgreSQL no Neon
    const result = await prisma.$queryRaw<any[]>`SELECT version()`;
    if (result) {
      dbStatus = 'online';
      dbVersion = result[0].version;
    }
  } catch (error) {
    dbStatus = 'error';
    console.error('❌ [DATABASE] Health check failed:', error);
  }

  res.json({
    status: 'online',
    message: 'Welcome to the A Grande Família Blog API!',
    environment: process.env.NODE_ENV || 'development',
    documentation: '/api-docs',
    database: {
      provider: 'PostgreSQL (Neon.tech)',
      status: dbStatus,
      version: dbVersion,
      note: 'Métricas de cluster (requests/CPU) estão disponíveis no painel do Neon.tech'
    },
    owner: 'Lucas Avelino Fraga'
  });
});

// Rotas da API
app.use('/api/v1', routes);

// Inicialização (Apenas Local)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  prisma.$connect()
    .then(() => {
      console.log('✅ [INFO] Database connected via Prisma');
      app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      console.error('❌ [ERROR] Database connection failed:', error);
    });
}

export default app;