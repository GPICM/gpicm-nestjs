/* eslint-disable prettier/prettier */

import { PostMedia } from "../../entities/PostMedia";

export abstract class PostMediasRepository {
  abstract bulkAdd(
    postMedias: PostMedia[],
    options?: { transactionContext?: unknown }
  ): Promise<void>;

  abstract findManyByPostId(postId: number): Promise<PostMedia[]>;
}
