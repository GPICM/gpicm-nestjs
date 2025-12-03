import { UserRoles } from "@/modules/identity/core/domain/enums/user-roles";
import { UserStatus } from "@/modules/identity/core/domain/enums/user-status";
import { UserAvatar } from "@/modules/shared/domain/object-values/user-avatar";
import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";

export type ProfileSummary = {
  id: number;
  handle: string;
  displayName: string;
};

export class ManagedUser {
  public id: number;

  public publicId: string;

  public name: string | null;

  public gender: string | null;

  public isVerified: boolean | null;

  public status: UserStatus;

  public role: UserRoles;

  public createdAt: Date;

  public updateAt: Date | null;

  public email: string;

  public avatar: UserAvatar | null;

  public activeProfile: ProfileSummary | null;

  public lastLoginAt: Date | null;

  public bio: string | null;

  constructor(args: NonFunctionProperties<ManagedUser>) {
    Object.assign(this, args);
  }
}
