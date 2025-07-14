import { PostComment } from "../../entities/PostComment";
import {
  BaseRepositoryFindManyFilters,
  BaseRepositoryFindManyResult,
} from "../dto/base-repository-filters";

export abstract class PostCommentRepository {
  abstract add(comment: PostComment): Promise<void>;
  abstract findById(id: number): Promise<PostComment | null>;
  abstract listAllByPostId(
    postId: number,
    filters: BaseRepositoryFindManyFilters & { parentId?: number | null },
    userId?: number
  ): Promise<BaseRepositoryFindManyResult<PostComment>>;

  abstract update(comment: PostComment): Promise<void>;
  abstract delete(id: number): Promise<void>;
  abstract refreshPostCommentsCount(postId: number): Promise<void>;
  abstract refreshPostCommentsRepliesCount(parentId: number): Promise<void>;
}
