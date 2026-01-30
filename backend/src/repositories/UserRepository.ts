import { prisma } from '../config/prisma';
import { User, Gender } from '@prisma/client';

export class UserRepository {
  
  async create(data: { 
    name: string; 
    email: string; 
    password: string; 
    birthDate?: Date | null; 
    gender?: Gender 
  }): Promise<User> {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        birthDate: data.birthDate,
        gender: data.gender,
      },
    });
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
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