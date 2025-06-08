import { Inject, Logger } from "@nestjs/common";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import {
  BaseRepositoryFindManyFilters,
  BaseRepositoryFindManyResult,
  PostRepository,
} from "../domain/interfaces/repositories/post-repository";
import { Post } from "../domain/entities/Post";
import { Prisma, PrismaClient } from "@prisma/client";
import { PostAssembler, postInclude } from "./mappers/post.assembler";
import { ViewerPost } from "../domain/entities/ViewerPost";

export class PrismaPostRepository implements PostRepository {
  private readonly logger: Logger = new Logger(PrismaPostRepository.name);

  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService
  ) {}

  public async add(
    post: Post,
    options?: { transactionContext?: PrismaClient }
  ): Promise<number> {
    const prisma = options?.transactionContext ?? this.prisma;

    try {
      this.logger.log(`Adding new post with ID: ${post.title}`);
      const sql = PostAssembler.toSqlInsert(post);

      this.logger.debug(`Parsed post data: ${sql}`);

      const created = await prisma.$executeRawUnsafe(sql);
      if (created !== 1) throw new Error("Failed to add post");

      const result = await prisma.$queryRaw`SELECT LAST_INSERT_ID() as id;`;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const insertedId = Number((result as any)[0]!.id);
      this.logger.log(`Successfully stored post: ${insertedId}`);

      return insertedId;
    } catch (error: unknown) {
      this.logger.error("Failed to add post", { post, error });
      throw new Error("Failed to add post");
    }
  }

  public async update(
    post: Post,
    options?: { transactionContext?: PrismaClient }
  ): Promise<void> {
    const prisma = options?.transactionContext ?? this.prisma;

    try {
      this.logger.log(
        `Updating post with ID: ${post.id}, Title: ${post.title}`
      );
      await prisma.post.update({
        where: { id: post.id! },
        data: PostAssembler.toPrismaUpdate(post),
      });

      this.logger.log(`Post updated successfully with ID: ${post.id}`);
    } catch (error: unknown) {
      this.logger.error("Failed to update post", { post, error });
      throw new Error("Failed to update post");
    }
  }

  public async findBySlug(
    slug: string,
    userId: number
  ): Promise<ViewerPost | null> {
    try {
      this.logger.log(`Fetching post by slug: ${slug}`);
      const modelData = await this.prisma.post.findUnique({
        where: { slug },
        include: {
          ...postInclude,
          Votes: { where: { userId }, select: { value: true, userId: true } },
        },
      });

      if (!modelData) {
        this.logger.warn(`No post found for slug: ${slug}`);
        return null;
      }

      this.logger.log(`Post found for slug: ${slug}`);
      return PostAssembler.fromPrisma(modelData, userId);
    } catch (error: unknown) {
      this.logger.error(`Failed to find post by slug: ${slug}`, { error });
      throw new Error("Failed to find post by slug");
    }
  }

  async findByUuid(uuid: string, userId: number): Promise<ViewerPost | null> {
    try {
      this.logger.log(`Fetching post by uuid: ${uuid}`);
      const modelData = await this.prisma.post.findUnique({
        where: { uuid },
        include: {
          ...postInclude,
          Votes: { where: { userId }, select: { value: true, userId: true } },
        },
      });

      if (!modelData) {
        this.logger.warn(`No post found for uuid: ${uuid}`);
        return null;
      }

      this.logger.log(`Post found for uuid: ${uuid}`);
      return PostAssembler.fromPrisma(modelData, userId);
    } catch (error: unknown) {
      this.logger.error(`Failed to find post by uuid: ${uuid}`, { error });
      throw new Error("Failed to find post by uuid");
    }
  }

  public async listAll(
    filters: BaseRepositoryFindManyFilters,
    userId: number
  ): Promise<BaseRepositoryFindManyResult<ViewerPost>> {
    try {
      const skip = filters.offset;
      const take = filters.limit;
      const sort = filters.sort ?? "publishedAt";
      const order = filters.order ?? "desc";

      const where: Prisma.PostWhereInput = {};

      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search } },
          { content: { contains: filters.search } },
        ];
      }

      this.logger.log(
        `Listing posts with filters: skip=${skip}, take=${take}, sort=${sort}, order=${order}, search=${filters.search ?? "none"}`
      );

      const [prismaResult, count] = await Promise.all([
        this.prisma.post.findMany({
          where,
          take,
          skip,
          orderBy: { [sort]: order },
          include: {
            ...postInclude,
            Votes: { where: { userId }, select: { value: true, userId: true } },
          },
        }),
        this.prisma.post.count({ where }),
      ]);

      const records = PostAssembler.fromPrismaMany(prismaResult, userId);

      this.logger.log(`Listed ${records.length} posts out of total ${count}`);

      return { records, count };
    } catch (error: unknown) {
      this.logger.error("Failed to list posts", { error });
      throw new Error("Failed to list posts");
    }
  }
}
