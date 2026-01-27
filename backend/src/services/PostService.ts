import { PostRepository } from '../repositories/PostRepository';

// Instanciamos o repositório
const postRepository = new PostRepository();

export const postService = {
  
  // CRIAR
  create: async (data: { title: string; content: string; authorId: string }) => {
    const newPost = await postRepository.create({
      title: data.title,
      content: data.content,
      authorId: data.authorId,
    });
    return newPost;
  },

  // LISTAR TODOS
  async findAll(currentUserId?: string) {
    // Busca dados brutos do repositório (incluindo arrays relacionais)
    const posts: any = await postRepository.findAll(currentUserId);

    // Data Transformation:
    // Adequa o formato do objeto para facilitar o consumo no Frontend.
    // Transformamos o array de likes em um booleano simples 'isLiked'.
    return posts.map((post: any) => ({
      ...post,
      likeCount: post._count.likes,      
      isLiked: post.likes?.length > 0    
    }));
  },

  // BUSCAR POR ID
  async getPostById(id: string, currentUserId?: string) {
    const post: any = await postRepository.findById(id, currentUserId);
    
    if (!post) {
      throw new Error('Post not found.');
    }

    // Mesma formatação do findAll para manter consistência na API
    return {
      ...post,
      likeCount: post._count.likes,
      isLiked: post.likes?.length > 0
    };
  },

  // ATUALIZAR
  async updatePost(id: string, userId: string, data: { title?: string; content?: string }) {
    const post = await postRepository.findById(id); 
    
    if (!post) {
      throw new Error('Post not found.');
    }

    // Validação de Permissão: Apenas o dono pode alterar
    if (post.authorId !== userId) {
      throw new Error('Unauthorized action.');
    }

    return await postRepository.update(id, data);
  },

  // DELETAR
  async deletePost(id: string, userId: string) {
    const post = await postRepository.findById(id);

    if (!post) {
      throw new Error('Post not found.');
    }

    // Validação de Permissão (Nota: O Controller pode ter logica extra para Admin)
    if (post.authorId !== userId) {
      throw new Error('Unauthorized action.');
    }

    return await postRepository.delete(id);
  }
};