import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { UserRoles } from "../enums/user-roles";
import { randomUUID } from "crypto";
import { UserStatus } from "../enums/user-status";
import { UserCredential } from "./UserCredential";
import { AuthProviders } from "../enums/auth-provider";

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
  public credentials: UserCredential[];

  constructor(args: NonFunctionProperties<User>) {
    Object.assign(this, args);
  }

  public getCredential(provider: AuthProviders): UserCredential | null {
    const found = this.credentials.find((c) => c.provider === provider);
    return found ?? null;
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

  public static Create(name: string, credential: UserCredential) {
    try {
      console.log("DEBUG: Creating user", { name, credential });

      const publicId = randomUUID();
      const deviceKey = randomUUID();

      console.log("DEBUG: Generated:", { publicId, deviceKey });

      console.log("DEBUG: newCredential", { credential });

      return new User({
        name,
        publicId,
        deviceKey,
        role: UserRoles.USER,
        status: UserStatus.ACTIVE,
        ipAddress: null,
        deviceInfo: null,
        bio: null,
        birthDate: null,
        gender: null,
        isVerified: false,
        lastLoginAt: null,
        phoneNumber: null,
        profilePicture: null,
        credentials: [credential],
      });
    } catch (error: unknown) {
      console.log("Failed to create new user", { error });
      throw error;
    }
  }

  public isGuest() {
    return this.role === UserRoles.GUEST && !this.credentials.length;
  }

  public isUser() {
    return this.role === UserRoles.USER && !!this.credentials.length;
  }

  public setId(newUserId: number) {
    this.id = newUserId;
    if (this.credentials.length) {
      for (const cred of this.credentials) {
        cred.setUserId(newUserId);
      }
    }
  }

  public setName(name: string) {
    // TODO: validate name length
    this.name = name;
  }

  public setRole(r: UserRoles) {
    this.role = r;
  }

  public addCredentials(credential: UserCredential) {
    this.credentials.push(credential);
  }

  public toJSON() {
    return {
      id: this.id,
      publicId: this.publicId,
      name: this.name,
      profilePicture: this.profilePicture ?? null,
      gender: this.gender ?? null,
      role: this.role,
    };
  }
}
