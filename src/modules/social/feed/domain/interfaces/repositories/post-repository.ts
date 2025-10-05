/* eslint-disable prettier/prettier */

import { BaseRepositoryFindManyFilters, BaseRepositoryFindManyResult } from "@/modules/social/core/domain/interfaces";
import { Post } from "../../entities/Post";
import { ViewerPost } from "../../entities/ViewerPost";
import { PostSortBy } from "../../enum/OrderBy";


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

  abstract incrementViews(post: Post): Promise<void>;

  abstract listAll(
    filters: PostFindManyFilters,
    userId: number
  ): Promise<BaseRepositoryFindManyResult<ViewerPost>>;

  abstract delete(post: Post): Promise<void>;
  
}

export interface PostFindManyFilters extends BaseRepositoryFindManyFilters {
  startDate?: Date;
  endDate?: Date;
  sortBy?: PostSortBy
  tags?: string[];
  authorId?: number;
}
