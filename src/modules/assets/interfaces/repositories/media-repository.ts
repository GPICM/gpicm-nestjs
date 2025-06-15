/* eslint-disable prettier/prettier */

import { Media } from "../../domain/entities/Media";

export abstract class MediaRepository {
  abstract add(
    media: Media,
    options?: { transactionContext?: unknown }
  ): Promise<number>;

  abstract update(
    media: Media,
    options?: { transactionContext?: unknown }
  ): Promise<void>;

  abstract findById(id: number): Promise<Media | null>;
}
