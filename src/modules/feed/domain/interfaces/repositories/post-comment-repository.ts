import { CommentType, PostComment } from "../../entities/PostComment";
import { CreateReplyCommentDto } from "../../../presentation/dtos/create-reply-comment.dto";

export abstract class PostCommentRepository {
  abstract create(
    comment: {
      postId: number;
      userId: number;
      content: string;
      user?: any;
      parentCommentId?: number | null;
    }
  ): Promise<PostComment>;
  abstract findById(id: number): Promise<PostComment | null>;
  abstract findByPostId(postId: number): Promise<PostComment[]>;
  abstract createReply(
    dto: CreateReplyCommentDto & { postId: number; userId: number; user?: any }
  ): Promise<PostComment>;
  abstract update(
    id: number,
    data: Partial<Omit<PostComment, "id" | "createdAt" | "userId" | "postId">>
  ): Promise<PostComment>;
  abstract delete(id: number): Promise<void>;
}