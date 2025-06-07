/* eslint-disable prettier/prettier */

import { Post } from "../../entities/Post";
import { ViewerPost } from "../../entities/ViewerPost";

export abstract class PostRepository {
  abstract add(
    post: Post,
    options?: { transactionContext?: unknown }
  ): Promise<number>;

  abstract update(
    post: Post,
    options?: { transactionContext?: unknown }
  ): Promise<void>;

  abstract findByUuid(uuid: string, userId: number): Promise<ViewerPost | null>;

  abstract findBySlug(slug: string, userId: number): Promise<ViewerPost | null>;

  abstract listAll(
    filters: BaseRepositoryFindManyFilters,
    userId: number
  ): Promise<BaseRepositoryFindManyResult<ViewerPost>>;
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
