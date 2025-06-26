/* eslint-disable prettier/prettier */

import { Media, MediaStatusEnum } from "../../domain/entities/Media";

export abstract class MediaRepository {
  abstract add(
    media: Media,
    options?: { transactionContext?: unknown }
  ): Promise<string>;

  abstract update(
    media: Media,
    options?: { transactionContext?: unknown }
  ): Promise<void>;

  abstract findById(id: string): Promise<Media | null>;

  abstract findManyByIds(
    ids: string[],
    filters?: {
      statusIn?: MediaStatusEnum[];
    }
  ): Promise<Media[]>;
}
