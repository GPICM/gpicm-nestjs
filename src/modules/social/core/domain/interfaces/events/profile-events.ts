import { EventBusEnvelope } from "@/modules/shared/domain/interfaces/events";
import { Profile } from "../../entities/Profile";

export type SocialProfileEventName =
  | "profile.created"
  | "profile.followed"
  | "profile.unfollowed";

export class ProfileEvent extends EventBusEnvelope<
  SocialProfileEventName,
  {
    profileId: number;
    targetProfileId?: number;
  }
> {
  constructor(
    name: SocialProfileEventName,
    profile: Profile,
    targetProfile?: Profile
  ) {
    super(
      name,
      { profileId: profile.id, targetProfileId: targetProfile?.id },
      { targetProfile, profile }
    );
  }
}
