import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { User } from "@/modules/identity/core/domain/entities/User";
import { UserAvatar } from "@/modules/shared/domain/object-values/user-avatar";

export class Profile {
  public id: number;
  public userId: number;
  public handle: string;
  public bio: string;
  public displayName: string;
  public followersCount: number;
  public followingCount: number;
  public postsCount: number;
  public commentsCount: number;
  public avatar: UserAvatar | null = null;
  public reputation: number;
  // Users Virtual
  public readonly phoneNumber: string | null = null;
  public readonly gender: string | null = null;
  public readonly birthDate: Date | null = null;
  public readonly fullName: string | null = null;
  public readonly isUserVerified: boolean | null = null;
  public readonly lastLoginAt: Date | null = null;

  constructor(args: NonFunctionProperties<Profile>) {
    Object.assign(this, args);
  }

  public static fromUser(
    user: User,
    displayName: string,
    handle: string
  ): Profile {
    return new Profile({
      id: -1,
      handle,
      bio: "",
      displayName,
      userId: user.id,
      birthDate: user.birthDate,
      gender: user.gender,
      phoneNumber: user.phoneNumber,
      fullName: user.name,
      isUserVerified: user.isVerified,
      lastLoginAt: user.lastLoginAt,
      avatar: null,
      followersCount: 0,
      followingCount: 0,
      commentsCount: 0,
      postsCount: 0,
      reputation: 0,
    });
  }

  public setId(newId: number) {
    if (this.id === -1) {
      this.id = newId;
    }
  }

  public setAvatar(avatar: UserAvatar | null) {
    this.avatar = avatar;
  }

  public toJSON() {
    const { avatar, ...rest } = this;
    return {
      ...rest,
      avatarUrl: avatar?.getAvatarUrl() || "",
    };
  }
}
