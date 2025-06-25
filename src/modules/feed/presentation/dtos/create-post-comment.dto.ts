import { CommentType } from "../../domain/entities/PostComment";
import { IsString,IsInt, Min, IsOptional, MaxLength } from "class-validator";

export class CreatePostCommentDto {
  @IsString()
  @MaxLength(255)
  content: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  parentCommentId: number;
}