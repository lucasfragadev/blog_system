import mongoose, { Types } from "mongoose";
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
  },

  findAll: async (): Promise<IPost[]> => {
    try {
      const posts = await PostModel.find().populate('author', 'name email').sort({ createdAt: -1 });
      return posts;
    } catch (error) {
      console.error("Erro ao buscar postagens:", error);
      throw error;
    }
  },

  findById: async (id: string): Promise<IPost | null> => {
    try {

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      const foundPost = await PostModel.findById(id).populate('author', 'name email')
      return foundPost;
    } catch (error) {
      throw error;
    }
  },

  updateById: async (id: string, data: { title?: string, content?: string }): Promise<IPost | null> => {
    try {

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      const updatePost = await PostModel.findByIdAndUpdate(
        id, 
        data, 
        { new: true}
      );

      return updatePost;
    } catch (error) {
      console.error("Erro ao atualizar o post:", error);
      throw error;
    }
  },

  deleteById: async (id: string): Promise<IPost | null> => {
    try {
      if(!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      const deletePost = await PostModel.findByIdAndDelete(id);
      return deletePost;
      
    } catch (error) {
      console.error("Erro ao deletar o post:", error);
      throw error;
      
    }
  }
}