/* eslint-disable prettier/prettier */

import { Post } from "../../entities/Post";
import { ViewerPost } from "../../entities/ViewerPost";
import {
  BaseRepositoryFindManyFilters,
  BaseRepositoryFindManyResult,
} from "../dto/base-repository-filters";

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

  abstract listByRelevance(
    filters: BaseRepositoryFindManyFilters,
    userId: number
  ): Promise<BaseRepositoryFindManyResult<ViewerPost>>;
}

export * from "../dto/base-repository-filters";
