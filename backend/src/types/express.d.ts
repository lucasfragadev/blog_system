import { Request } from 'express';

export {};

// Declaration Merging (TypeScript):
// Estamos expandindo a interface padrão 'Request' do Express para incluir propriedades customizadas.
declare global {
  namespace Express {
    interface Request {
      // Injetado pelo authMiddleware após decodificar o JWT
      user?: {
        id: string;
        name: string;
      };
      // Injetado pelo cookie-parser. O Express nativo não tipa isso automaticamente.
      cookies?: { [key: string]: string }; 
    }
  }
}