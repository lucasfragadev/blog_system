"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postController = void 0;
const PostService_1 = require("../services/PostService");
exports.postController = {
    create: async (req, res) => {
        const { title, content } = req.body;
        const authorId = req.user?.id;
        try {
            if (!title || !content || !authorId) {
                return res.status(400).json({ message: "Title, author and content are required." });
            }
            const newPost = await PostService_1.postService.create({ title, content, authorId });
            return res.status(201).json(newPost);
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'An unexpected server error occurred.' });
        }
    },
    getAll: async (req, res) => {
        try {
            const posts = await PostService_1.postService.findAll();
            return res.status(200).json(posts);
        }
        catch (error) {
            return res.status(500).json({ message: "An unexpected server error occurred." });
        }
    },
    getById: async (req, res) => {
        const { id } = req.params;
        try {
            const post = await PostService_1.postService.getPostById(id);
            return res.status(200).json(post);
        }
        catch (error) {
            if (error.message === 'Post não encontrado.') {
                return res.status(404).json({ message: error.message });
            }
            console.error("Error fetching post by ID:", error);
            return res.status(500).json({ message: "An unexpected server error occurred." });
        }
    },
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const authorId = req.user?.id;
            const { title, content } = req.body;
            if (!authorId) {
                return res.status(403).json({ message: "Ação não autorizada." });
            }
            const updatedPost = await PostService_1.postService.updatePost(id, authorId, { title, content });
            return res.status(200).json(updatedPost);
        }
        catch (error) {
            if (error.message === 'Post não encontrado.') {
                return res.status(404).json({ message: error.message });
            }
            if (error.message === 'Ação não autorizada.') {
                return res.status(403).json({ message: error.message });
            }
            console.error("Erro ao atualizar post:", error);
            return res.status(500).json({ message: "Ocorreu um erro inesperado." });
        }
    }
};
