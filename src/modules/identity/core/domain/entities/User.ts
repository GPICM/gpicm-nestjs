import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { UserRoles } from "../enums/user-roles";
import { randomUUID } from "crypto";
import { UserStatus } from "../enums/user-status";
import { UserCredential } from "../../../auth/domain/entities/UserCredential";
import { AuthProviders } from "../enums/auth-provider";

export class User {
  public id: number;

  public publicId: string;

  public name: string | null;

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

  public latitude: number | null;

  public longitude: number | null;

  public locationUpdatedAt: Date | null;

  public createdAt: Date;

  public updateAt: Date | null;

  // Virtual
  public credentials: UserCredential[];

  constructor(args: NonFunctionProperties<User>) {
    Object.assign(this, args);
  }

  public getCredential(provider: AuthProviders): UserCredential | null {
    const found = this.credentials.find((c) => c.provider === provider);
    return found ?? null;
  }

  public static Create(name: string, credential?: UserCredential) {
    try {
      const publicId = randomUUID();
      const deviceKey = randomUUID();

      return new User({
        id: -1,
        name,
        publicId,
        deviceKey,
        role: UserRoles.USER,
        status: credential ? UserStatus.ACTIVE : UserStatus.GUEST,
        credentials: credential ? [credential] : [],
        ipAddress: null,
        deviceInfo: null,
        bio: null,
        birthDate: null,
        gender: null,
        isVerified: false,
        lastLoginAt: null,
        phoneNumber: null,
        latitude: null,
        longitude: null,
        locationUpdatedAt: null,
        createdAt: new Date(),
        updateAt: null,
      });
    } catch (error: unknown) {
      console.log("Failed to create new user", { error });
      throw error;
    }
  }

  public isGuest() {
    return this.status === UserStatus.GUEST && !this.credentials.length;
  }

  public isActive() {
    return this.status === UserStatus.ACTIVE && !!this.credentials.length;
  }

  public isAdmin() {
    return (
      this.role === UserRoles.ADMIN &&
      this.status === UserStatus.ACTIVE &&
      !!this.credentials.length
    );
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
    this.name = name;
  }

  public setRole(r: UserRoles) {
    this.role = r;
  }

  public setStatus(s: UserStatus) {
    this.status = s;
  }

  public addCredentials(credential: UserCredential) {
    credential.userId = this.id;
    this.credentials.push(credential);
  }

  public toJSON() {
    return {
      id: this.id,
      publicId: this.publicId,
      name: this.name,
      gender: this.gender ?? null,
      role: this.role,
      status: this.status,
      latitude: this.latitude,
      longitude: this.longitude,
      phoneNumber: this.phoneNumber,
      birthDate: this.birthDate,
      email: this.credentials[0]?.email,
      locationUpdatedAt: this.locationUpdatedAt,
      createdAt: this.createdAt,
      updatedAt: this.updateAt
    };
  }
}
