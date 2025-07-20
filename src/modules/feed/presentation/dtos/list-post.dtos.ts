/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable prettier/prettier */
import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { PostSortBy } from "../../domain/enum/OrderBy";
export class ListPostQueryDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  readonly page: number = 1;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform((p) => (p.value === "" ? 16 : Number(p.value)))
  readonly limit: number = 16;

  @IsString()
  @IsOptional()
  readonly search: string = "";

  @IsDate({ message: "Invalid Date" })
  @IsOptional()
  @Transform((p) => (p.value === "" ? undefined : new Date(p.value)))
  startDate?: Date;

  @IsDate({ message: "Invalid Date" })
  @IsOptional()
  @Transform((p) => (p.value === "" ? undefined : new Date(p.value)))
  endDate?: Date;
  
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value.map(String);
    if (typeof value === 'string') return value.split(',').map(String);
    return [];
  })
  @IsArray()
  @IsString({ each: true })
  readonly tags: string[] = [];

  @IsOptional()
  @IsEnum(PostSortBy)
  readonly sortBy: PostSortBy = PostSortBy.NEWEST;
}
