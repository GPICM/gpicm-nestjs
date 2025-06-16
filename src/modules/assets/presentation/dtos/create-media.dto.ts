import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ImageTargetEnum } from "../../domain/enums/image-target-enum";

export class UploadMediaDto {
  @IsNotEmpty()
  @IsEnum(ImageTargetEnum)
  target: ImageTargetEnum;

  @IsString()
  @IsOptional()
  altText?: string;

  @IsString()
  @IsOptional()
  caption?: string;
}
