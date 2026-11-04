import { UserRoles } from "@/modules/identity/core/domain/enums/user-roles";
import { UserStatus } from "@/modules/identity/core/domain/enums/user-status";
import { Transform, Type } from "class-transformer";
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export const LIST_USERS_SORT_FIELDS = [
  "createdAt",
  "lastLoginAt",
  "name",
] as const;
export const LIST_USERS_ACTIVITY = [
  "7d",
  "30d",
  "90d",
  "inactive90",
  "never",
] as const;
export type ListUsersActivity = (typeof LIST_USERS_ACTIVITY)[number];

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

  @IsOptional()
  @IsIn(LIST_USERS_SORT_FIELDS)
  readonly sort?: (typeof LIST_USERS_SORT_FIELDS)[number];

  @IsOptional()
  @IsIn(["asc", "desc"])
  readonly order?: "asc" | "desc";

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }: { value: unknown }) =>
    value === "true" ? true : value === "false" ? false : value
  )
  readonly verified?: boolean;

  @IsOptional()
  @IsIn(LIST_USERS_ACTIVITY)
  readonly activity?: ListUsersActivity;

  @IsOptional()
  @IsDateString()
  readonly createdFrom?: string;

  @IsOptional()
  @IsDateString()
  readonly createdTo?: string;
}
