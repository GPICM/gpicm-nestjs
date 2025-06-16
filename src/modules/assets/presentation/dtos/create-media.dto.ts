import { IsOptional, IsString } from "class-validator";

export class UploadMediaDto {
  @IsString()
  @IsOptional()
  altText?: string;

  @IsString()
  @IsOptional()
  caption?: string;
}
