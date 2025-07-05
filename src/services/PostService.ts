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
  }
};