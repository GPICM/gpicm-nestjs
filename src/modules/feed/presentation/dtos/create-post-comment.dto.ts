import { CommentType } from "../../domain/entities/PostComment";
import { IsString, MaxLength } from "class-validator";

export class CreatePostCommentDto {
  @IsString()
  @MaxLength(255)
  content: string;
  type: CommentType;
}