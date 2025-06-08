/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Type } from "class-transformer";
import {
  IsDate,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from "class-validator";
import { PostTypeEnum } from "../../domain/entities/Post";

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  imagePreviewUrl?: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsLatitude()
  @Type(() => Number)
  latitude: number;

  @IsLongitude()
  @Type(() => Number)
  longitude: number;

  @IsEnum(PostTypeEnum)
  @IsOptional()
  readonly type: PostTypeEnum = PostTypeEnum.INCIDENT;

  @ValidateIf((o: any) => o.type === PostTypeEnum.INCIDENT)
  @IsDate({ message: "Data é obrigatória" })
  @Type(() => Date)
  incidentDate: Date;

  @ValidateIf((o: any) => o.type === PostTypeEnum.INCIDENT)
  @IsNumber({}, { message: "incidentTypeId é obrigatório" })
  @Type(() => Number)
  incidentTypeId: number;

  @IsString()
  @IsOptional()
  observation?: string;
}
