import { Type } from "class-transformer";
import {
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDate,
} from "class-validator";

export class UpdateLocationDto {
  @IsLatitude()
  @Type(() => Number)
  latitude: number;

  @IsLongitude()
  @Type(() => Number)
  longitude: number;
}

export class UpdateUserDataDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: "O nome não pode ser vazio." })
  name?: string | null;

  @IsOptional()
  @IsString()
  gender?: string | null;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: "Data de nascimento inválida." })
  birthDate?: Date | null;

  @IsOptional()
  @IsString()
  phoneNumber?: string | null;

  @IsOptional()
  @IsString()
  bio?: string | null;
}

export class UpdateUserAvatarDto {
  @IsOptional()
  @IsString()
  avatarMediaId: string | null;
}
