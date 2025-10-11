import { AppQueuePublisher } from "@/modules/shared/domain/interfaces/application-queue";
import {
  SocialPostBusEnvelopeName,
  SocialPostCommentsBusEnvelopeName,
} from "@/modules/social/core/domain/interfaces/events";

export const SOCIAL_POSTS_EVENTS_QUEUE_NAME = "social.posts.events";

export type SocialPostEventsQueueDto = {
  postId: number;
};

export type SocialPostQueueEvent =
  | SocialPostBusEnvelopeName
  | SocialPostCommentsBusEnvelopeName;

export abstract class SocialPostEventsQueuePublisher extends AppQueuePublisher<
  SocialPostQueueEvent,
  SocialPostEventsQueueDto
> {}
