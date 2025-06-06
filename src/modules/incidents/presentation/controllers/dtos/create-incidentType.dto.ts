import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class CreateIncidentTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @IsNotEmpty()
  internalId: number;
}
