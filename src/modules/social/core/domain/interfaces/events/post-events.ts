import { EventContract } from "@/modules/shared/domain/interfaces/application-event-publisher";

export const POST_CREATED_EVENT_NAME = "post.created";

export type PostCreatedEvent = EventContract<{
  postId: number;
}>;
