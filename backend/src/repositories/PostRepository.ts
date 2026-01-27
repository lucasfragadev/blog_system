import { prisma } from '../config/prisma';
import { Post } from '@prisma/client';

export class PostRepository {
  
  async create(data: { title: string; content: string; authorId: string }): Promise<Post> {
    const post = await prisma.post.create({
      data: {
        title: data.title,
        content: data.content,
        authorId: data.authorId,
      },
    });
    return post;
  }

  async findAll(currentUserId?: string) {
    return await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { name: true, email: true },
        },
        // Count Relation: Traz a contagem de relacionamentos direto na query principal
        _count: {
          select: { comments: true, likes: true }, 
        },
        // Conditional Include:
        // Se currentUserId existir (usuário logado), busca se ele deu like neste post.
        // Se for undefined (usuário anônimo), passa 'false' e o Prisma ignora essa busca.
        likes: currentUserId ? {
          where: { userId: currentUserId },
          select: { userId: true }
        } : false
      },
    });
  }

  async findById(id: string, currentUserId?: string) {
    return await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: { name: true, email: true },
        },
        _count: {
          select: { comments: true, likes: true },
        },
        // Reutiliza a lógica de Conditional Include para verificar o status de 'liked'
        likes: currentUserId ? {
          where: { userId: currentUserId },
          select: { userId: true }
        } : false
      },
    });
  }

  async update(id: string, data: { title?: string; content?: string }): Promise<Post> {
    return await prisma.post.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
      },
    });
  }

  async delete(id: string): Promise<Post> {
    return await prisma.post.delete({
      where: { id },
    });
  }
}