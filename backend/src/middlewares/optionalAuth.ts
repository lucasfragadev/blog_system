import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return next();

    const decoded = jwt.verify(token, secret) as { id: string; name: string };
    
    // Injeta o usuário no request para o controller usar
    req.user = decoded;
    
    next();
  } catch (err) {
    // Se o token for inválido, apenas ignoramos e tratamos como anônimo
    next();
  }
};