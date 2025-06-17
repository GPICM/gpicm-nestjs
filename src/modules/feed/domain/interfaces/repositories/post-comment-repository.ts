import { PostComment } from "../../entities/PostComment";

export abstract class PostCommentRepository {
  abstract create(
    comment: Omit<PostComment, "id" | "createdAt" | "updatedAt">
  ): Promise<PostComment>;
  abstract findById(id: number): Promise<PostComment | null>;
  //abstract findByPostId(postId: number): Promise<PostComment[]>;
  abstract update(
    id: number,
    data: Partial<Omit<PostComment, "id" | "createdAt" | "userId" | "postId">>
  ): Promise<PostComment>;
  abstract delete(id: number): Promise<void>;
}
