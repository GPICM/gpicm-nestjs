import { UserRoles } from "@/modules/identity/core/domain/enums/user-roles";
import { UserStatus } from "@/modules/identity/core/domain/enums/user-status";
import { Transform, Type } from "class-transformer";
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

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
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(UserStatus, { each: true })
  @Transform(({ value }: { value: any }) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    typeof value === "string" ? value.split(",") : value
  )
  readonly statuses?: UserStatus[];

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(UserRoles, { each: true })
  @Transform(({ value }: { value: any }) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    typeof value === "string" ? value.split(",") : value
  )
  readonly roles?: UserRoles[];
}
