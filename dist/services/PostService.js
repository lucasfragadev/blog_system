"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postService = void 0;
const PostRepository_1 = require("../repositories/PostRepository");
exports.postService = {
    /**
     * @description Handles the business logic for creating a new post.
     * @param postData - Post data.
     * @returns The newly created post.
     */
    create: async (postData) => {
        try {
            const dataForRepo = {
                title: postData.title,
                content: postData.content,
                author: postData.authorId,
            };
            const newPost = await PostRepository_1.postRepository.create(dataForRepo);
            return newPost;
        }
        catch (error) {
            throw error;
        }
    },
    findAll: async () => {
        try {
            const posts = await PostRepository_1.postRepository.findAll();
            return posts;
        }
        catch (error) {
            throw error;
        }
    },
    getPostById: async (id) => {
        try {
            const foundPostById = await PostRepository_1.postRepository.findById(id);
            if (!foundPostById) {
                throw new Error('Post não encontrado.');
            }
            return foundPostById;
        }
        catch (error) {
            throw error;
        }
    },
    updatePost: async (id, userId, data) => {
        try {
            const posts = await PostRepository_1.postRepository.findById(id);
            if (!posts) {
                throw new Error('Post não encontrado.');
            }
            const authorId = posts.author._id.toString();
            if (authorId !== userId) {
                throw new Error('Ação não autorizada.');
            }
            const updatePost = await PostRepository_1.postRepository.updateById(id, data);
            return updatePost;
        }
        catch (error) {
            throw error;
        }
    }
};
