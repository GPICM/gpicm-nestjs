import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

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
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  deviceKey?: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1) // if you want to enforce at least one accepted policy
  @IsString({ each: true })
  acceptedPolicies: string[];
}
