import { CommentType } from "../../entities/PostComment";

export class CreatePostCommentDto {
  content: string;
  type: CommentType;
}
