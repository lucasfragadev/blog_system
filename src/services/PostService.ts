import { PostRepository } from '../repositories/PostRepository';

// Instanciamos o repositório (pois agora ele é uma Class)
const postRepository = new PostRepository();

export const postService = {
  
  // CRIAR
  create: async (data: { title: string; content: string; authorId: string }) => {
    // Passamos direto para o repositório do Prisma
    const newPost = await postRepository.create({
      title: data.title,
      content: data.content,
      authorId: data.authorId,
    });
    return newPost;
  },

  // LISTAR TODOS
  findAll: async () => {
    return await postRepository.findAll();
  },

  // BUSCAR POR ID
  getPostById: async (id: string) => {
    const post = await postRepository.findById(id);
    if (!post) {
      throw new Error('Post not found.');
    }
    return post;
  },

  // ATUALIZAR (Com verificação de dono)
  updatePost: async (id: string, userId: string, data: { title?: string; content?: string }) => {
    // 1. Busca o post
    const post = await postRepository.findById(id);
    
    if (!post) {
      throw new Error('Post not found.');
    }

    // 2. Verifica autoria
    // No Prisma, o ID do autor fica direto em 'authorId'. 
    // Não precisamos de ._id ou .toString()
    if (post.authorId !== userId) {
      throw new Error('Unauthorized action.');
    }

    // 3. Atualiza
    return await postRepository.update(id, data);
  },

  // DELETAR (Com verificação de dono)
  deletePost: async (id: string, userId: string) => {
    const post = await postRepository.findById(id);

    if (!post) {
      throw new Error('Post not found.');
    }

    if (post.authorId !== userId) {
      throw new Error('Unauthorized action.');
    }

    return await postRepository.delete(id);
  }
};