import { Router } from 'express';
import { commentController } from '../controllers/CommentController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', authMiddleware, commentController.create);

router.get('/post/:postId', commentController.listByPost);

export default router;