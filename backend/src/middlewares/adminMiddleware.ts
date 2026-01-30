import { Request, Response, NextFunction } from 'express';

/**
 * Middleware de Autorização: Garante que apenas administradores
 * possam prosseguir para a rota protegida.
 */
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // O authMiddleware injeta o usuário decodificado no req.user
  // Verificamos se o role (definido no login) é 'ADMIN'
  const user = req.user as { id: string; name: string; role?: string };

  if (user && user.role === 'ADMIN') {
    return next();
  }

  return res.status(403).json({ 
    message: "Acesso negado. Esta área é restrita aos administradores da Família Avelino Fraga." 
  });
};