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

  // eslint-disable-next-line @typescript-eslint/require-await
  public async add(
    post: Post,
    options?: { transactionContext?: PrismaClient }
  ): Promise<number> {
    const prisma = options?.transactionContext ?? this.prisma;

    try {
      this.logger.log(`Adding new post:`, { post });
      const parsedData = PostAssembler.toPrisma(post);

      this.logger.log(`Parsed data: ${JSON.stringify(parsedData, null, 4)}`);

      const created = await prisma.post.create({
        data: parsedData,
      });

      this.logger.log(`post added successfully: ${post.id}`);

      return created.id;
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
      this.logger.log(`Adding new post: ${post.title}`);
      await prisma.post.update({
        where: { id: post.id! },
        data: PostAssembler.toPrisma(post),
      });

      this.logger.log(`post added successfully: ${post.id}`);
    } catch (error: unknown) {
      this.logger.error("Failed to add post", { post, error });
      throw new Error("Failed to add post");
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

      this.logger.log(`post found: ${slug}`);
      return PostAssembler.fromPrisma(modelData, userId);
    } catch (error: unknown) {
      this.logger.error(`Failed to find post by slug: ${slug}`, {
        error,
      });
      throw new Error("Failed to find post by slug");
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
        this.prisma.post.count({
          where,
        }),
      ]);

      const records = PostAssembler.fromPrismaMany(prismaResult, userId);
      return { records, count };
    } catch (error: unknown) {
      this.logger.error("Failed to list posts", { error });
      throw new Error("Failed to list posts");
    }
  }
}
