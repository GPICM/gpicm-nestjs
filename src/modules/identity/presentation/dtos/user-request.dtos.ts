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

  //IsOptional() permite o dado não vir na requisição, mas @IsNotEmpty não permite ele vir vazio
  @IsOptional() 
  @IsString()
  @IsNotEmpty({ message: "O nome não pode ser vazio." })
  name: string | null;

  @IsOptional() 
  @IsString()
  profilePicture: string | null;

  @IsOptional() 
  @IsString()
  gender: string | null;

  
  @IsOptional()
  @IsDate()
  birthDate: Date | null;

  @IsOptional()
  @IsString()
  phoneNumber: string | null;

  @IsOptional()
  @IsString()
  bio: string | null;
}

export class UserBasicDataDto {
  @IsOptional()
  @IsString()
  name?: string | null;

  @IsOptional()
  @IsString()
  bio?: string | null;

  @IsOptional()
  @IsString()
  profilePicture?: string | null;

  @IsOptional()
  @IsString()
  gender?: string | null;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  birthDate?: Date | null;

  @IsOptional()
  @IsString()
  phoneNumber?: string | null;
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  updatedAt: Date | null;
}