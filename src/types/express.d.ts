// Importa a interface Request do Express
import { Request } from 'express';

// Extende a interface Request para adicionar a propriedade user
declare module 'express' {
  export interface Request {
    user?: {
      id: string;
      role: string;
    };
  }
}
