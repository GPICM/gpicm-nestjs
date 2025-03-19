import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { UserRoles } from "../enums/user-roles";
import { randomUUID } from "crypto";

export class User {
  public id?: number;
  public uuid: string;
  public name: string | null;
  public email: string | null;
  public role: UserRoles;
  public ipAddress: string | null;
  public deviceKey: string | null;
  public deviceInfo: Record<string, unknown> | null;
  public credentials: any[];

  constructor(args: NonFunctionProperties<User>) {
    Object.assign(this, args);
  }

  public static CreateGuest(
    deviceKey: string,
    ipAddress?: string,
    deviceInfo?: Record<string, unknown>,
  ) {
    return new User({
      uuid: randomUUID(),
      email: "",
      name: "Visitante",
      deviceInfo: deviceInfo ?? null,
      ipAddress: ipAddress ?? null,
      role: UserRoles.GUEST,
      deviceKey,
      credentials: [],
    });
  }

  public isGuest() {
    return this.role === UserRoles.GUEST && !this.credentials.length;
  }

  public setEmail(email: string) {
    // TODO: validate email here
    this.email = email;
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
