import { prisma } from '../config/prisma';

export class CommentRepository {
  
  async create(content: string, authorId: string, postId: string) {
    return await prisma.comment.create({
      data: {
        content,
        authorId,
        postId
      },
      include: {
        author: { select: { name: true } } // Já retorna o nome do autor
      }
    });
  }

  async findByPostId(postId: string) {
    return await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' }, // Mais recentes primeiro
      include: {
        author: {
          select: { id: true, name: true } // Precisamos do nome para exibir
        }
      }
    });
  }
}