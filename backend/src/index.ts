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

// CONFIGURAÇÃO DO SWAGGER (Versão Final "Anti-Tela-Branca" para Vercel)
// Carregamos absolutamente tudo via CDN para não depender de arquivos locais
const SWAGGER_ASSETS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5";

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customCssUrl: `${SWAGGER_ASSETS_URL}/swagger-ui.min.css`,
  customJs: [
    `${SWAGGER_ASSETS_URL}/swagger-ui-bundle.js`,
    `${SWAGGER_ASSETS_URL}/swagger-ui-standalone-preset.js`
  ],
  swaggerOptions: {
    persistAuthorization: true,
  },
}));

// ROTA DE BOAS-VINDAS COM HEALTH CHECK DO NEON
app.get('/', async (req, res) => {
  let dbStatus = 'offline';
  let dbVersion = 'N/A';

  try {
    // Executa uma query simples para confirmar saúde e versão do banco
    const result = await prisma.$queryRaw<any[]>`SELECT version()`;
    if (result && result.length > 0) {
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
      note: 'Métricas de CPU e Requests estão disponíveis no dashboard do Neon.tech'
    },
    owner: 'Lucas Avelino Fraga'
  });
});

// Rotas da API
app.use('/api/v1', routes);

// Inicialização (Apenas em ambiente local)
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