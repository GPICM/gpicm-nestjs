import { Inject, Logger } from "@nestjs/common";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import {
  BaseRepositoryFindManyFilters,
  BaseRepositoryFindManyResult,
  PostRepository,
} from "../domain/interfaces/repositories/post-repository";
import { Post } from "../domain/entities/Post";
import { PostAssembler, postInclude } from "./mappers/post.assembler";
import { Prisma } from "@prisma/client";

export class PrismaPostRepository implements PostRepository {
  private readonly logger: Logger = new Logger(PrismaPostRepository.name);

  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService
  ) {}

  public async add(post: Post): Promise<void> {
    try {
      this.logger.log(`Adding new post: ${post.title}`);
      await this.prisma.post.create({
        data: PostAssembler.toPrisma(post),
      });

      this.logger.log(`post added successfully: ${post.id}`);
    } catch (error: unknown) {
      this.logger.error("Failed to add post", { post, error });
      throw new Error("Failed to add post");
    }
  }

  public async updateLikesCount(postId: number, count: number): Promise<void> {
    try {
      this.logger.log(`Updating likes count for postId: ${postId}`);
      await this.prisma.post.update({
        where: { id: postId },
        data: { countLikes: count },
      });

      this.logger.log(`Likes count updated successfully for postId: ${postId}`);
    } catch (error: unknown) {
      this.logger.error("Failed to update likes count", { postId, error });
      throw new Error("Failed to update likes count");
    }
  }

  public async findBySlug(slug: string): Promise<Post | null> {
    try {
      this.logger.log(`Fetching post by slug: ${slug}`);
      const modelData = await this.prisma.post.findUnique({
        where: { slug },
        include: postInclude,
      });

      this.logger.log(`post found: ${slug}`);
      return PostAssembler.fromPrisma(modelData);
    } catch (error: unknown) {
      this.logger.error(`Failed to find post by slug: ${slug}`, {
        error,
      });
      throw new Error("Failed to find post by slug");
    }
  }

  public async listAll(
    filters: BaseRepositoryFindManyFilters,
    options?: { transactionContext?: unknown }
  ): Promise<BaseRepositoryFindManyResult<Post>> {
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
          include: postInclude,
        }),
        this.prisma.post.count({
          where,
        }),
      ]);

      const records = PostAssembler.fromPrismaMany(prismaResult);
      return { records, count };
    } catch (error: unknown) {
      this.logger.error("Failed to list posts", { error });
      throw new Error("Failed to list posts");
    }
  }
}
