import { IsString, MaxLength, IsInt, Min } from "class-validator";
import { CommentType } from "../../domain/entities/PostComment";

export class CreateReplyCommentDto {
  @IsInt()
  @Min(1)
  parentCommentId: number;

  @IsString()
  @MaxLength(255)
  content: string;

  type: CommentType;
}