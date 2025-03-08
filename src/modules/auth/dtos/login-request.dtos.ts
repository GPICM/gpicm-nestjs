import { IsString } from "class-validator";

export class LoginRequestBodyDto {
  @IsString()
  token: string;
}
