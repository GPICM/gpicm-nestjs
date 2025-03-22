import { IsString } from "class-validator";

export class SignInRequestBodyDto {
  @IsString()
  captchaToken: string;

  @IsString()
  deviceKey: string;

  @IsString()
  name?: string;
}

export class SignUpRequestBodyDto extends SignInRequestBodyDto {
  @IsString()
  name: string;

  @IsString()
  email: string;
}
