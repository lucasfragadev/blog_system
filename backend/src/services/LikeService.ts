import { LikeRepository } from '../repositories/LikeRepository';

export class LikeService {
  private likeRepository: LikeRepository;

  constructor() {
    this.likeRepository = new LikeRepository();
  }

  async toggleLike(userId: string, postId: string) {
    // 1. Verifica estado atual para decidir a ação (Toggle)
    const existingLike = await this.likeRepository.find(userId, postId);

    if (existingLike) {
      // 2. Se já existe o relacionamento, removemos (Unlink)
      await this.likeRepository.delete(userId, postId);
      return { liked: false };
    } else {
      // 3. Se não existe, criamos o relacionamento (Link)
      await this.likeRepository.create(userId, postId);
      return { liked: true };
    }
  }
}