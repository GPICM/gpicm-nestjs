import { IsEnum, IsOptional, IsString } from "class-validator";
import { ImageTargetEnum } from "../../domain/enums/image-target-enum";

export class UploadMediaDto {
  @IsOptional()
  @IsEnum(ImageTargetEnum)
  readonly target?: ImageTargetEnum;

  @IsString()
  @IsOptional()
  altText?: string;

  @IsString()
  @IsOptional()
  caption?: string;
}
