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
  | "follow"
  | "unfollow"
  | "comment"
  | "uncomment"
  | "post";

export abstract class SocialProfileEventsQueuePublisher extends AppQueuePublisher<
  SocialProfileEvent,
  SocialProfileEventsQueueDto
> {}

export abstract class SocialProfileEventsQueueConsumer extends AppQueueConsumer<
  SocialProfileEvent,
  SocialProfileEventsQueueDto
> {}
