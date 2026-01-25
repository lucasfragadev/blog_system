import { PrismaClient } from '@prisma/client';

// Cria uma única instância da conexão com o banco
export const prisma = new PrismaClient();