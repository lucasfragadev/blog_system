import { Types } from "mongoose";
import PostModel, { IPost } from "../models/Post";

interface ICreatePostData {
  title: string;
  content: string;
  author: Types.ObjectId | string;
}

export const postRepository = {
  /**
   * @description Creates a new post in the database.
   * @param postData - The post data to be created.
   * @returns The newly created post.
   */

  create: async (postData: ICreatePostData): Promise<IPost> => {
    try {
      const newPost = await PostModel.create(postData);
      return newPost;
    } catch (error) {
      console.error("Erro ao criar post no repositório:", error);
      throw error;
    }
  }
}