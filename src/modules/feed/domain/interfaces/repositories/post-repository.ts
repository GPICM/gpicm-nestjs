/* eslint-disable prettier/prettier */

import { Post } from "../../entities/Post";

export abstract class PostRepository {
  abstract add(
    post: Post,
    options?: { transactionContext?: unknown }
  ): Promise<number>;

  abstract update(
    post: Post,
    options?: { transactionContext?: unknown }
  ): Promise<void>;

  abstract findBySlug(slug: string): Promise<Post | null>;

  abstract listAll(
    filters: BaseRepositoryFindManyFilters
  ): Promise<BaseRepositoryFindManyResult<Post>>;
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
