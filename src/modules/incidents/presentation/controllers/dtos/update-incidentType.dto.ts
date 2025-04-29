import { IsOptional, IsString, IsInt } from "class-validator";
export class UpdateIncidentTypeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  internalId?: number;
}