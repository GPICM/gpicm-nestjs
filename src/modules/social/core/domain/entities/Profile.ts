import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { User } from "@/modules/identity/domain/entities/User";

export class Profile {
  id: number;
  userId: number;
  handle: string;
  bio: string;
  displayName: string;
  profileImage: string | null;

  // metrics (TODO: IN THE FUTURE MOVE IT O MONGO COLLECTION OR SPECIALIZED METRICS TABLE)
  followersCount: number;
  followingCount: number;
  postsCount: number;
  commentsCount: number;
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
      profileImage: null,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      commentsCount: 0,
    });
  }

  public setId(newId: number) {
    this.id = newId;
  }

  public setAvatar(avatarUrl: string | null) {
    this.profileImage = avatarUrl;
  }
}
