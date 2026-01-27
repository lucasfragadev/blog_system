import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Estratégia Híbrida:
  // 1. Tenta pegar do Cookie (Padrão para Browsers/Segurança HttpOnly).
  // 2. Fallback para Header Authorization (Para testes no Postman ou Mobile).
  let token = req.cookies?.token;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  // Bloqueio imediato se nenhuma credencial for encontrada
  if (!token) {
    return res.status(401).json({ message: 'Access Denied. Token not provided.' });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT Secret not configured');
    }

    // Valida a assinatura e a expiração do token. 
    // Se falhar, o jwt.verify lança uma exceção automaticamente para o catch.
    const decoded = jwt.verify(token, secret);

    // Injeta os dados decodificados (payload) no objeto Request.
    // Isso permite que os Controllers subsequentes acessem req.user.id sem consultar o banco novamente.
    req.user = decoded as { id: string; name: string };

    return next();
    
  } catch (err) {
    // Log interno para debug, essencial para monitorar tentativas de invasão ou erros de config
    console.error('Auth middleware error:', err);
    
    // Tratamento específico de erros JWT ajuda o Frontend a decidir a ação (ex: Redirecionar para Login)
    if (err instanceof jwt.JsonWebTokenError) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired.' });
      }
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token format.' });
      }
    }
    
    // Erro crítico de infraestrutura (variável de ambiente faltando)
    if (err instanceof Error && err.message === 'JWT Secret not configured') {
      console.error('CRITICAL: JWT_SECRET environment variable not set');
      return res.status(500).json({ message: 'Server configuration error.' });
    }
    
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};