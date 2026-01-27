import { prisma } from '../config/prisma';
import { User } from '@prisma/client'; 

export class UserRepository {
  
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

  async findByEmail(email: string): Promise<User | null> {
    // findUnique aproveita o índice unique (@unique) do banco para buscas O(1)
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
    });
  }
}