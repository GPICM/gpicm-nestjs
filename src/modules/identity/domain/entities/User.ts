import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { UserRoles } from "../enums/user-roles";
import { randomUUID } from "crypto";
import { UserStatus } from "../enums/user-status";
import { UserCredential } from "../../authentication/domain/entities/UserCredential";
import { AuthProviders } from "../enums/auth-provider";
import { UserBasicData } from "../value-objects/user-basic-data";
import { UserAvatar } from "../value-objects/user-avatar";

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

  public avatar: UserAvatar | null;

  // Virtual
  public credentials: UserCredential[];

  constructor(args: NonFunctionProperties<User>) {
    Object.assign(this, args);
  }

  public getCredential(provider: AuthProviders): UserCredential | null {
    const found = this.credentials.find((c) => c.provider === provider);
    return found ?? null;
  }

  public setAvatar(avatar: UserAvatar | null): void {
    this.avatar = avatar;
  }

  public getAvatar(): UserAvatar | null {
    return this.avatar;
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
        role: credential ? UserRoles.USER : UserRoles.GUEST,
        status: UserStatus.ACTIVE,
        credentials: credential ? [credential] : [],
        avatar: null,
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
    this.name = name;
  }

  public setRole(r: UserRoles) {
    this.role = r;
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
      latitude: this.latitude,
      longitude: this.longitude,
      locationUpdatedAt: this.locationUpdatedAt,
      avatarUrl: this.avatar?.getAvatarUrl() || "",
    };
  }

  public toUserBasicData(): UserBasicData {
    let email = "";
    const emailCredentials = this.getCredential(AuthProviders.EMAIL_PASSWORD);
    if (emailCredentials) {
      email = emailCredentials.email;
    }

    return {
      name: this.name,
      email,
      bio: this.bio,
      gender: this.gender ?? null,
      phoneNumber: this.phoneNumber,
      birthDate: this.birthDate,
      createdAt: this.createdAt,
      updatedAt: this.updateAt,
      avatarUrl: this.avatar?.getAvatarUrl() || "",
    };
  }
}
