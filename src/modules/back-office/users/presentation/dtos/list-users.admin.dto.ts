import { UserRoles } from "@/modules/identity/domain/enums/user-roles";
import { UserStatus } from "@/modules/identity/domain/enums/user-status";
import { Transform, Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";

export class ListUsersAdminQueryDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  readonly page: number = 1;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform((p) => (p.value === "" ? 16 : Number(p.value)))
  readonly limit: number = 16;

  @IsString()
  @IsOptional()
  readonly search: string = "";

  @IsOptional()
  @IsEnum(UserStatus)
  readonly status?: UserStatus;

  @IsOptional()
  @IsEnum(UserRoles)
  readonly role?: UserRoles;
}
