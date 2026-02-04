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
    const result = await prisma.$transaction(async (tx) => {
      const familyMember = await tx.familyMember.create({
        data: {
        name: data.name,
        birthDate: data.birthDate,
          gender: data.gender || 'OUTRO',
      },
    });

      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: data.password,
          birthDate: data.birthDate,
          gender: data.gender,
          familyMemberId: familyMember.id,
        },
      });

    return user;
    });

    return result;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        familyMember: true,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        familyMember: true,
      },
    });
  }
}