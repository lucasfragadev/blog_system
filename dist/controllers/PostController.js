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
    }
};
