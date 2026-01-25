import { Request } from 'express';

export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
      };
      cookies?: { [key: string]: string }; 
    }
  }
}