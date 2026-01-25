import { prisma } from '../config/prisma';
import { Post } from '@prisma/client';

export class PostRepository {
  
  // Criar Post
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

  // Listar todos os posts (Com dados do Autor!)
  async findAll(): Promise<Post[]> {
    return await prisma.post.findMany({
      orderBy: {
        createdAt: 'desc', // Ordena do mais novo para o mais antigo
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
            // NÃO incluímos 'password' aqui por segurança
          },
        },
      },
    });
  }

  // Buscar um post específico pelo ID
  async findById(id: string): Promise<Post | null> {
    return await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Atualizar Post
  async update(id: string, data: { title?: string; content?: string }): Promise<Post> {
    return await prisma.post.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
      },
    });
  }

  // Deletar Post
  async delete(id: string): Promise<Post> {
    return await prisma.post.delete({
      where: { id },
    });
  }
}