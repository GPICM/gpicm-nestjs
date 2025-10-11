import { AppQueuePublisher } from "@/modules/shared/domain/interfaces/application-queue";
import {
  SocialPostBusEnvelopeName,
  SocialPostCommentsBusEnvelopeName,
  SocialProfileEventName,
} from "@/modules/social/core/domain/interfaces/events";

export const SOCIAL_PROFILE_EVENTS_QUEUE_NAME = "social.profile.events";

export type SocialProfileEventsQueueDto = {
  profileId: number;
  targetProfileId?: number;
};

export type SocialProfileQueueEvent =
  | SocialProfileEventName
  | SocialPostBusEnvelopeName
  | SocialPostCommentsBusEnvelopeName;

export abstract class SocialProfileEventsQueuePublisher extends AppQueuePublisher<
  SocialProfileQueueEvent,
  SocialProfileEventsQueueDto
> {}
