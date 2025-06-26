import { Inject, Logger } from "@nestjs/common";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { MediaRepository } from "../../interfaces/repositories/media-repository";
import { Media, MediaStatusEnum } from "../../domain/entities/Media";
import { MediaAssembler } from "./mappers/media.assembler";
import { MediaStatus, Prisma, PrismaClient } from "@prisma/client";

export class PrismaMediaRepository implements MediaRepository {
  private readonly logger: Logger = new Logger(MediaRepository.name);

  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService
  ) {}

  public async findManyByIds(
    ids: string[],
    filters?: {
      statusIn?: MediaStatusEnum[];
    }
  ): Promise<Media[]> {
    try {
      const where: Prisma.MediaWhereInput = {
        id: { in: ids },
        deletedAt: null,
      };

      if (filters?.statusIn?.length) {
        where.status = { in: filters.statusIn as MediaStatus[] };
      }

      const result = await this.prisma.media.findMany({
        where,
      });
      return MediaAssembler.fromPrismaMany(result);
    } catch (error: unknown) {
      this.logger.error("[findManyByIds] Failed to find medias", {
        ids,
        error,
      });
      throw new Error("[findManyByIds] Failed to find medias");
    }
  }

  public async add(
    media: Media,
    options?: { transactionContext?: PrismaClient }
  ): Promise<string> {
    const prisma = options?.transactionContext ?? this.prisma;

    try {
      const data = MediaAssembler.toPrismaCreate(media);
      const result = await prisma.media.create({ data });
      return result.id;
    } catch (error: unknown) {
      this.logger.error("Failed to add media", { media, error });
      throw new Error("Failed to add media");
    }
  }

  public async update(
    media: Media,
    options?: { transactionContext?: PrismaClient }
  ): Promise<void> {
    const prisma = options?.transactionContext ?? this.prisma;

    try {
      const data = MediaAssembler.toPrismaCreate(media);
      await prisma.media.update({
        where: { id: media.id },
        data,
      });
    } catch (error: unknown) {
      this.logger.error(`Failed to update media with ID ${media.id}`, {
        media,
        error,
      });
      throw new Error("Failed to update media");
    }
  }

  public async findById(id: string): Promise<Media | null> {
    try {
      this.logger.log("Getting media by id", { id });
      const result = await this.prisma.media.findUnique({ where: { id } });

      this.logger.log("Media from prisma", { result });
      return MediaAssembler.fromPrisma(result);
    } catch (error: unknown) {
      this.logger.error(`Failed to find media with ID ${id}`, { error });
      throw new Error("Failed to find media");
    }
  }
}
