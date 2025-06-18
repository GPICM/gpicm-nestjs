import { PrismaClient } from "@prisma/client";
import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@/modules/shared/services/prisma-services";

import { PostMediasRepository } from "../domain/interfaces/repositories/post-media-repository";
import { PostMedia } from "../domain/entities/PostMedia";
import { PostMediaAssembler } from "./mappers/post-media.assembler";

@Injectable()
export class PrismaPostMediasRepository implements PostMediasRepository {
  private readonly logger: Logger = new Logger(PrismaPostMediasRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  public async bulkAdd(
    postMedias: PostMedia[],
    options?: { transactionContext?: PrismaClient }
  ): Promise<void> {
    try {
      const prisma = options?.transactionContext ?? this.prisma;

      await prisma.postMedia.createMany({
        data: PostMediaAssembler.toPrismaCreateMany(postMedias),
      });

      this.logger.log(`Post Medias created`);
    } catch (error: unknown) {
      this.logger.error("Failed to create post medias", { error });
      throw new Error("Failed to create post medias");
    }
  }
}
