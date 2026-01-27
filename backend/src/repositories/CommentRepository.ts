import { prisma } from '../config/prisma';

export class CommentRepository {
  
  async create(content: string, authorId: string, postId: string) {
    return await prisma.comment.create({
      data: {
        content,
        authorId,
        postId
      },
      // Include: Retorna o objeto Author imediatamente na criação.
      // Isso evita ter que fazer uma segunda requisição para atualizar a UI com o nome de quem comentou.
      include: {
        author: { select: { name: true } } 
      }
    });
  }

  async findByPostId(postId: string) {
    return await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' }, 
      include: {
        // Projection (Select): Trazemos apenas o necessário do autor para exibir no card.
        // Importante para não expor dados sensíveis (email, senha, etc) no JSON de resposta.
        author: {
          select: { id: true, name: true } 
        }
      }
    });
  }
}