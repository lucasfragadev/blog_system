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
    }
};
