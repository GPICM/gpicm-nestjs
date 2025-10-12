import { IsString, IsOptional } from "class-validator";

export class UpdateProfileAvatarDto {
  @IsOptional()
  @IsString()
  avatarMediaId: string | null;
}
