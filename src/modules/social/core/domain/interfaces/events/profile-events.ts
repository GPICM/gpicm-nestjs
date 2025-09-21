import { EventContract } from "@/modules/shared/domain/interfaces/events";

/* Event to be trigger when the user follows/unfollow someone */

export type ProfileFollowingEventName =
  | "profile.followed"
  | "profile.unfollowed";

export type ProfileFollowingEvent = EventContract<
  ProfileFollowingEventName,
  {
    profileId: number;
    targetProfileId: number;
  }
>;
