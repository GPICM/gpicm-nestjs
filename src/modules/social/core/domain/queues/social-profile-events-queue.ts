import {
  AppQueuePublisher,
  AppQueueConsumer,
} from "@/modules/shared/domain/interfaces/application-queue";

export type SocialProfileEventsQueueDto = {
  profileId: number;
  followingId: number;
};

export const SOCIAL_PROFILE_EVENTS_QUEUE_NAME = "social.profile.events";

export type SocialProfileEvent = "follow" | "unfollow";

export abstract class SocialProfileEventsQueuePublisher extends AppQueuePublisher<
  SocialProfileEvent,
  SocialProfileEventsQueueDto
> {}

export abstract class SocialProfileEventsQueueConsumer extends AppQueueConsumer<
  SocialProfileEvent,
  SocialProfileEventsQueueDto
> {}
