import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { UserRoles } from "../enums/user-roles";
import { randomUUID } from "crypto";
import { UserStatus } from "../enums/user-status";
export class User {
  public id?: number;
  public publicId: string;
  public name: string | null;
  public profilePicture: string | null;
  public gender: string | null;
  public isVerified: boolean | null;
  public birthDate: Date | null;
  public phoneNumber: string | null;
  public lastLoginAt: Date | null;
  public bio: string | null;
  public status: UserStatus;
  public deviceKey: string;
  public deviceInfo: Record<string, unknown> | null;
  public ipAddress: string | null;
  public role: UserRoles;

  // Virtual
  public credentials: any[];

  constructor(args: NonFunctionProperties<User>) {
    Object.assign(this, args);
  }

  public static CreateGuest(
    name?: string,
    ipAddress?: string,
    deviceInfo?: Record<string, unknown>
  ) {
    const newDeviceKey = randomUUID();

    return new User({
      publicId: randomUUID(),
      name: name ?? `Visitante_${new Date().getTime()}`,
      status: UserStatus.ACTIVE,
      role: UserRoles.GUEST,
      deviceKey: newDeviceKey,
      deviceInfo: deviceInfo ?? null,
      ipAddress: ipAddress ?? null,
      bio: null,
      birthDate: null,
      gender: null,
      isVerified: false,
      lastLoginAt: null,
      phoneNumber: null,
      profilePicture: null,
      credentials: [],
    });
  }

  public isGuest() {
    return this.role === UserRoles.GUEST && !this.credentials.length;
  }

  public setId(newId: number) {
    this.id = newId;
  }

  public setName(name: string) {
    // TODO: validate name length
    this.name = name;
  }

  public setRole(r: UserRoles) {
    // TODO: VALID IF VALID ROLES
    this.role = r;
  }
}
