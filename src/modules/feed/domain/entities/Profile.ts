import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { User } from "@/modules/identity/domain/entities/User";

export class Profile {
  id: number;
  userId: number;
  bio: string | null;
  profileImage: string | null;
  latitude: number | null;
  longitude: number | null;
  followersCount: number;
  followingCount: number;

  constructor(args: NonFunctionProperties<Profile>) {
    Object.assign(this, args);
  }
  public static fromUser(user: User): Profile {
    return new Profile({
      id: user.id,
      userId: user.id,
      bio: null,
      profileImage: user?.avatar?.getAvatarUrl() || null,
      latitude: user.latitude ?? null,
      longitude: user.longitude ?? null,
      followersCount: 0,
      followingCount: 0,
    });
  }
}
