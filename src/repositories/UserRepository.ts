import { prisma } from '../config/prisma';
import { User } from '@prisma/client'; 

export class UserRepository {
  // Criar Usuário
  async create(data: { name: string; email: string; password: string }): Promise<User> {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
      },
    });
    return user;
  }

  // Buscar por Email
  async findByEmail(email: string): Promise<User | null> {
    // findUnique é muito rápido e exige que o campo seja @unique no schema
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  // Buscar por ID
  async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
    });
  }
}