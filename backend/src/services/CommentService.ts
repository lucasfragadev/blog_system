import { CommentRepository } from '../repositories/CommentRepository';

export class CommentService {
  private commentRepository: CommentRepository;

  constructor() {
    this.commentRepository = new CommentRepository();
  }

  async createComment(content: string, authorId: string, postId: string) {
    if (!content) {
      throw new Error("Content is required.");
    }
    // Aqui poderíamos validar se o post existe, mas o Prisma já dá erro se não existir
    return await this.commentRepository.create(content, authorId, postId);
  }

  async getCommentsByPost(postId: string) {
    return await this.commentRepository.findByPostId(postId);
  }
}