"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRepository = void 0;
const Post_1 = __importDefault(require("../models/Post"));
exports.postRepository = {
    /**
     * @description Creates a new post in the database.
     * @param postData - The post data to be created.
     * @returns The newly created post.
     */
    create: async (postData) => {
        try {
            const newPost = await Post_1.default.create(postData);
            return newPost;
        }
        catch (error) {
            console.error("Erro ao criar post no repositório:", error);
            throw error;
        }
    },
    findAll: async () => {
        try {
            const posts = await Post_1.default.find().populate('author', 'name email').sort({ createdAt: -1 });
            return posts;
        }
        catch (error) {
            console.error("Erro ao buscar postagens:", error);
            throw error;
        }
    },
};
