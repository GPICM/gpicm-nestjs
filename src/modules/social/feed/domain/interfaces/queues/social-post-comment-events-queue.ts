import { AppQueuePublisher } from "@/modules/shared/domain/interfaces/application-queue";
import { SocialPostCommentsBusEnvelopeName } from "@/modules/social/core/domain/interfaces/events";

export const SOCIAL_POST_COMMENTS_EVENTS_QUEUE_NAME =
  "social.post-comments.events";

export type SocialPostCommentEventsQueueDto = {
  postId: number;
  commentId: number;
  parentId?: number;
};

export type SocialPostCommentQueueEvent = SocialPostCommentsBusEnvelopeName;

export abstract class SocialPostCommentEventsQueuePublisher extends AppQueuePublisher<
  SocialPostCommentQueueEvent,
  SocialPostCommentEventsQueueDto
> {}
