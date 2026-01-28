import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  // 1. Tenta buscar o token (Cookie ou Header)
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  // 2. Se não houver token, segue o fluxo como anônimo
  if (!token) {
    return next();
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return next();

    // 3. Valida o token
    const decoded = jwt.verify(token, secret) as { id: string; name: string };

    // 4. Injeta o usuário no Request (o mesmo que o authMiddleware faz)
    req.user = decoded;
    
    next();
  } catch (err) {
    // 5. Se o token for inválido, ignoramos e seguimos como anônimo
    // Não barramos o acesso pois a rota é pública.
    next();
  }
};