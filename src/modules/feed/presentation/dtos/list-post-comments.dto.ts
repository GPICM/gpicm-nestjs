import { Type } from "class-transformer";
import { IsOptional, IsInt, Min } from "class-validator";

export class ListPostCommentsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 16;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  parentId?: number;
}
