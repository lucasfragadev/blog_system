import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  let token = req.cookies?.token;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Access Denied. Token not provided.' });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT Secret not configured');
    }

    const decoded = jwt.verify(token, secret);

    req.user = decoded as { id: string; name: string };

    return next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    
    if (err instanceof jwt.JsonWebTokenError) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired.' });
      }
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token format.' });
      }
    }
    
    if (err instanceof Error && err.message === 'JWT Secret not configured') {
      console.error('CRITICAL: JWT_SECRET environment variable not set');
      return res.status(500).json({ message: 'Server configuration error.' });
    }
    
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};