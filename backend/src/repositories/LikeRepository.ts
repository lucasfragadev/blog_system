import { prisma } from '../config/prisma';

export class LikeRepository {
  
  // Busca um like específico usando a Chave Composta (Composite Key) definida no Schema
  async find(userId: string, postId: string) {
    return await prisma.like.findUnique({
      where: {
        // O Prisma gera esse campo 'userId_postId' automaticamente baseado no @@id([userId, postId])
        userId_postId: { userId, postId } 
      }
    });
  }

  async create(userId: string, postId: string) {
    return await prisma.like.create({
      data: { userId, postId }
    });
  }

  async delete(userId: string, postId: string) {
    return await prisma.like.delete({
      where: {
        userId_postId: { userId, postId }
      }
    });
  }

  // Aggregation: Conta registros sem precisar trazer os objetos do banco (Performance)
  async countByPost(postId: string) {
    return await prisma.like.count({
      where: { postId }
    });
  }
}