import { AppQueuePublisher } from "@/modules/shared/domain/interfaces/application-queue";

export type SocialGamificationEventsQueueDto = {
  profileId: number;
};

export const SOCIAL_GAMIFICATION_EVENTS_QUEUE_NAME =
  "social.gamification.events";

export type SocialPostEvent =
  | "profile.followed"
  | "profile.unfollowed"
  | "post.viewed"
  | "post.voted"
  | "post.created"
  | "post.commented"
  | "post.uncommented";

export abstract class SocialGamificationEventsQueuePublisher extends AppQueuePublisher<
  SocialPostEvent,
  SocialGamificationEventsQueueDto
> {}
