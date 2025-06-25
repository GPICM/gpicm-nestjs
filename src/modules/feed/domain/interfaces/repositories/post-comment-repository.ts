import { CommentType, PostComment } from "../../entities/PostComment";

export abstract class PostCommentRepository {
  abstract add(comment: PostComment): Promise<PostComment>;
  abstract findById(id: number): Promise<PostComment | null>;
  abstract findByPostId(postId: number): Promise<PostComment[]>;
  abstract update(comment: PostComment): Promise<PostComment>;
  abstract delete(id: number): Promise<void>;
}