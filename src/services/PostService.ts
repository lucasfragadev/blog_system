import { postRepository } from "../repositories/PostRepository";
import { IPost } from "../models/Post";

interface ICreatePostData {
  title: string;
  content: string;
  authorId: string;
}

export const postService = {
  /**
   * @description Handles the business logic for creating a new post.
   * @param postData - Post data.
   * @returns The newly created post.
   */
  create: async (postData: ICreatePostData): Promise<IPost> => {
    try {
      const dataForRepo = {
        title: postData.title,
        content: postData.content,
        author: postData.authorId,
      };
      const newPost = await postRepository.create(dataForRepo);
      return newPost;
    } catch (error) {
      throw error;
    }
  },

  findAll: async (): Promise<IPost[]> => {
    try {
      const posts = await postRepository.findAll();
      return posts;
    } catch (error) {
      throw error;
    }
  },

  getPostById: async (id: string): Promise<IPost> => {
    try {
      const foundPostById = await postRepository.findById(id);
      if (!foundPostById) {
        throw new Error('Post não encontrado.')
      }
      return foundPostById;
    } catch (error) {
      throw error;
    }
  },

  updatePost: async (id: string, userId: string, data: { title?: string, content?: string }): Promise<IPost | null> => {
    try {
      const posts = await postRepository.findById(id);
      if (!posts) {
        throw new Error('Post não encontrado.')
      }

      const authorId = posts.author._id.toString();
      if (authorId !== userId) {
        throw new Error('Ação não autorizada.');
      }

      const updatePost = await postRepository.updateById(id, data);
      return updatePost;

    } catch (error) {
      throw error;
    }
  },

  deletePost: async (id: string, userId: string): Promise<IPost | null> => {
    try {
      const post = await postRepository.findById(id);
      if(!post) {
        throw new Error('Post não encontrado.')
      }

      const authorId = post.author._id.toString();
      if (authorId !== userId) {
        throw new Error('Ação não autorizada.');
      }

      const deletedPost = await postRepository.deleteById(id);
      return deletedPost;

    } catch (error) {
      throw error;
    }
  }
};