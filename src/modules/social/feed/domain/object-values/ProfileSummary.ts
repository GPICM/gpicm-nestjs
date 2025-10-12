import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { Profile } from "@/modules/social/core/domain/entities/Profile";

export class ProfileSummary {
  id: number;
  name: string;
  handle: string;
  avatarUrl: string;

  constructor(args: NonFunctionProperties<ProfileSummary>) {
    Object.assign(this, args);
  }

  public static fromProfile(profile: Profile): ProfileSummary {
    return new ProfileSummary({
      id: profile.id,
      handle: profile.handle,
      name: profile.displayName,
      avatarUrl: profile.avatar?.getAvatarUrl() || "",
    });
  }

  public toJSON() {
    const serialized: Record<string, unknown> = { ...this } as Record<
      string,
      unknown
    >;
    delete serialized.id;
    return serialized;
  }
}
