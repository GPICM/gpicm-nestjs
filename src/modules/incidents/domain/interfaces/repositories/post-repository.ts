/* eslint-disable prettier/prettier */
import { Post } from "../../entities/Post";

export abstract class PostRepository {
  abstract add(post: Post): Promise<void>;

  abstract findBySlug(slug: string): Promise<Post | null>;

  abstract listAll(
    filters: BaseRepositoryFindManyFilters,
    options?: { transactionContext?: unknown }
  ): Promise<BaseRepositoryFindManyResult<Post>>;
  
  abstract updateLikesCount(postId: number, count: number): Promise<void>
  ;
}

// TODO: MOVE TO SOMEWHERE ELSE
export interface BaseRepositoryFindManyFilters {
  search?: string;
  offset?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface BaseRepositoryFindManyResult<Model> {
  count: number;
  records: Model[];
}
