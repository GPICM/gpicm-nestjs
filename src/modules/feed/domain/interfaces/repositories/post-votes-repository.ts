import { PostVote } from "../../entities/PostVote";

export abstract class PostVotesRepository {
  abstract add(postVote: PostVote): Promise<void>;

  abstract update(postVote: PostVote): Promise<void>;

  abstract delete(postVote: PostVote): Promise<void>;

  abstract findByPostId(
    postId: number,
    limit: number,
    offset: number
  ): Promise<{ userId: number; createdAt: Date }[]>;

  abstract findLikedPostIdsByUser(
    userId: number,
    postIds: number[]
  ): Promise<number[]>;
}
