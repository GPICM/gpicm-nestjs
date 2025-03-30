import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class GuestSignInRequestBodyDto {
  @IsString()
  captchaToken: string;

  @IsString()
  @IsOptional()
  deviceKey?: string;

  @IsString()
  @IsOptional()
  name?: string;
}

export class SignInRequestBodyDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class SignUpRequestBodyDto {
  @IsString()
  captchaToken: string;

  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  deviceKey?: string;
}
