import {
  AppQueuePublisher,
  AppQueueConsumer,
} from "@/modules/shared/domain/interfaces/application-queue";

export type SocialProfileEventsQueueDto = {
  profileId: number;
  targetProfileId?: number;
};

export const SOCIAL_PROFILE_EVENTS_QUEUE_NAME = "social.profile.events";

export type SocialProfileEvent =
  | "profile.followed"
  | "profile.unfollowed"
  | "post.created"
  | "post.commented"
  | "post.uncommented";

export abstract class SocialProfileEventsQueuePublisher extends AppQueuePublisher<
  SocialProfileEvent,
  SocialProfileEventsQueueDto
> {}

export abstract class SocialProfileEventsQueueConsumer extends AppQueueConsumer<
  SocialProfileEvent,
  SocialProfileEventsQueueDto
> {}
