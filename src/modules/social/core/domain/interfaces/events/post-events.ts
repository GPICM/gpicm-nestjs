import { EventBusEnvelope } from "@/modules/shared/domain/interfaces/events";
import { Post } from "@/modules/social/feed/domain/entities/Post";
import { PostComment } from "@/modules/social/feed/domain/entities/PostComment";
import { Profile } from "../../entities/Profile";

export type SocialPostBusEnvelopeName =
  | "post.viewed"
  | "post.voted"
  | "post.created";

/* -- POST EVENTS -- */

// TODO: CREATE PROFILE ON USER CREATE AND USE ONLY STATUS TO AUTHORIZE
// TODO: RENAME STATUS FROM PENDING_PROFILE TO WAITING_APPROVAL
export class PostEvent extends EventBusEnvelope<
  SocialPostBusEnvelopeName,
  {
    postId: number;
    userId: number;
    profileId?: number;
  }
> {
  constructor(
    name: SocialPostBusEnvelopeName,
    userId: number,
    post: Post,
    profileId?: number
  ) {
    super(name, { postId: post.id!, userId, profileId }, { post });
  }
}

/* -- POST COMMENTS EVENTS -- */

export type SocialPostCommentsBusEnvelopeName =
  | "post-comment.created"
  | "post-comment.updated"
  | "post-comment.removed"
  | "post-comment.replied";

export class PostCommentEvent extends EventBusEnvelope<
  SocialPostCommentsBusEnvelopeName,
  {
    postId: number;
    userId: number;
    profileId: number;
    commentId: number;
    parentCommentId?: number;
  }
> {
  constructor(
    name: SocialPostCommentsBusEnvelopeName,
    comment: PostComment,
    profile: Profile
  ) {
    super(
      name,
      {
        userId: profile.userId,
        profileId: profile.id,
        postId: comment.postId,
        commentId: comment.id,
        parentCommentId: comment.parentCommentId ?? undefined,
      },
      { comment }
    );
  }
}
