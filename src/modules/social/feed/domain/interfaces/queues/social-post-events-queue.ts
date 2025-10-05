import { AppQueuePublisher } from "@/modules/shared/domain/interfaces/application-queue";

export type SocialPostEventsQueueDto = {
  postId: number;
};

export const SOCIAL_POSTS_EVENTS_QUEUE_NAME = "social.posts.events";

export type SocialPostEvent =
  | "post.viewed"
  | "post.voted"
  | "post.created"
  | "post.commented"
  | "post.uncommented";

export abstract class SocialPostEventsQueuePublisher extends AppQueuePublisher<
  SocialPostEvent,
  SocialPostEventsQueueDto
> {}
