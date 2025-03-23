import { IsOptional, IsString } from "class-validator";

export class SignInRequestBodyDto {
  @IsString()
  captchaToken: string;

  @IsString()
  @IsOptional()
  deviceKey?: string;

  @IsString()
  @IsOptional()
  name?: string;
}

export class SignUpRequestBodyDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  password: string;
}
