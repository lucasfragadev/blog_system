import { CommentRepository } from '../repositories/CommentRepository';

export class CommentService {
  private commentRepository: CommentRepository;

  constructor() {
    this.commentRepository = new CommentRepository();
  }

  async createComment(content: string, authorId: string, postId: string) {
    // Validação de Regra de Negócio: Conteúdo não pode ser vazio
    if (!content) {
      throw new Error("Content is required.");
    }
    
    // A integridade referencial (se o post existe) é garantida pelo banco (Foreign Key).
    // Se o postId for inválido, o Prisma lançará um erro que o Controller captura.
    return await this.commentRepository.create(content, authorId, postId);
  }

  async getCommentsByPost(postId: string) {
    return await this.commentRepository.findByPostId(postId);
  }
}