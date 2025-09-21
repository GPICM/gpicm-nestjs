import { EventContract } from "@/modules/shared/domain/interfaces/events";

/* Event to be triggered when post is modified */
export type PostActionEventName =
  | "post.created"
  | "post.commented"
  | "post.uncommented";

export type PostActionEvent = EventContract<
  PostActionEventName,
  {
    postId: number;
    profileId: number;
  }
>;
