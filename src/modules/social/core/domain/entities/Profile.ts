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

  // Virtual
  private readonly phoneNumber: string | null = null;
  private readonly gender: string | null = null;
  private readonly birthDate: Date | null = null;
  private readonly avatarUrl: string | null = null;

  constructor(
    args: NonFunctionProperties<Profile>,
    virtual?: {
      gender: string | null;
      birthDate: Date | null;
      avatarUrl?: string | null;
      phoneNumber?: string | null;
    }
  ) {
    Object.assign(this, args);
    this.avatarUrl = virtual?.avatarUrl ?? null;
    this.gender = virtual?.gender ?? null;
    this.birthDate = virtual?.birthDate ?? null;
    this.phoneNumber = virtual?.phoneNumber ?? null;
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
