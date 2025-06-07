import { PostVote } from "../../entities/PostVote";
import {
  BaseRepositoryFindManyFilters,
  BaseRepositoryFindManyResult,
} from "../dto/base-repository-filters";

export abstract class PostVotesRepository {
  abstract add(postVote: PostVote): Promise<void>;

  abstract update(postVote: PostVote): Promise<void>;

  abstract upsert(
    postVote: PostVote,
    options?: { transactionContext?: unknown }
  ): Promise<void>;

  abstract delete(
    userId: number,
    postId: number,
    options?: { transactionContext?: unknown }
  ): Promise<void>;

  abstract findByPostId(
    postId: number,
    limit: number,
    offset: number
  ): Promise<PostVote[]>;

  abstract listAllByPostId(
    postId: number,
    filters: BaseRepositoryFindManyFilters,
    userId?: number
  ): Promise<BaseRepositoryFindManyResult<PostVote>>;
}
