export abstract class PostLikesRepository {
  abstract create(postId: number, userId: number): Promise<void>;
  abstract delete(postId: number, userId: number): Promise<void>;
  abstract exists(postId: number, userId: number): Promise<boolean>;
  abstract countByPost(postId: number): Promise<number>;
  abstract findByPost(postId: number, limit: number, offset: number): Promise<{ userId: number, createdAt: Date }[]>;
}