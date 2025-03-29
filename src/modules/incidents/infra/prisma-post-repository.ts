import { Inject, Logger } from "@nestjs/common";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { PostRepository } from "../domain/interfaces/repositories/post-repository";
import { Post } from "../domain/entities/Post";
import { PostAssembler, postInclude } from "./mappers/post.assembler";

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

  public async listAll(): Promise<Post[]> {
    try {
      this.logger.log("Fetching all posts...");
      const resultData = await this.prisma.post.findMany({
        orderBy: { publishedAt: "desc" },
        include: postInclude,
      });

      this.logger.log(`Total posts found: ${resultData.length}`);
      return PostAssembler.fromPrismaMany(resultData);
    } catch (error: unknown) {
      this.logger.error("Failed to list posts", { error });
      throw new Error("Failed to list posts");
    }
  }
}
