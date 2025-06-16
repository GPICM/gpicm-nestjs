import { Inject, Logger } from "@nestjs/common";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import {
  BaseRepositoryFindManyFilters,
  BaseRepositoryFindManyResult,
  PostRepository,
} from "../domain/interfaces/repositories/post-repository";
import { Post } from "../domain/entities/Post";
import { PrismaClient } from "@prisma/client";
import { PostAssembler } from "./mappers/post.assembler";
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

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await this.prisma.$queryRawUnsafe<any>(
        this.buildBasePostSelectQuery(`WHERE p.slug = ? GROUP BY p.id`),
        userId,
        slug
      );

      const parsed = PostAssembler.fromSqlSelect(result, userId);

      return parsed;
    } catch (error: unknown) {
      this.logger.error(`Failed to find post by slug: ${slug}`, { error });
      console.log(error);
      throw new Error("Failed to find post by slug");
    }
  }

  async findByUuid(uuid: string, userId: number): Promise<ViewerPost | null> {
    try {
      this.logger.log(`Fetching post by uuid: ${uuid}`);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await this.prisma.$queryRawUnsafe<any>(
        this.buildBasePostSelectQuery(`WHERE p.uuid = ? GROUP BY p.id`),
        userId,
        uuid
      );

      const parsed = PostAssembler.fromSqlSelect(result, userId);

      this.logger.log(`Post found for uuid: ${uuid}`);
      return parsed;
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
      const skip = filters.offset ?? 0;
      const take = filters.limit ?? 10;
      const sort = filters.sort ?? "published_at";
      const order = filters.order?.toUpperCase() === "ASC" ? "ASC" : "DESC";

      const searchFilter = filters.search ? `%${filters.search}%` : null;

      this.logger.log(
        `Listing posts (raw) with filters: skip=${skip}, take=${take}, sort=${sort}, order=${order}, search=${filters.search ?? "none"}`
      );

      const whereSearch = searchFilter
        ? `WHERE (p.title LIKE ? OR p.content LIKE ?)`
        : "";

      const params = searchFilter
        ? [userId, searchFilter, searchFilter, take, skip]
        : [userId, take, skip];

      this.logger.log(
        `Listing posts with filters: skip=${skip}, take=${take}, sort=${sort}, order=${order}, search=${filters.search ?? "none"}`
      );

      const query =
        this.buildBasePostSelectQuery(whereSearch) +
        ` ORDER BY p.${sort} ${order} LIMIT ? OFFSET ?`;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const [result, countResult] = await Promise.all([
        this.prisma.$queryRawUnsafe<any>(query, ...params),
        this.prisma.$queryRawUnsafe<any>(
          `
          SELECT COUNT(*) AS total
          FROM posts p
            ${searchFilter ? "WHERE (p.title LIKE ? OR p.content LIKE ?)" : ""}
          `,
          ...(searchFilter ? [searchFilter, searchFilter] : [])
        ),
      ]);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const count = Number(countResult[0]?.total ?? 0);
      const records = PostAssembler.fromSqlMany(result, userId);

      return { records: records, count };
    } catch (error: unknown) {
      console.log(error);
      this.logger.error("Failed to list posts", { error });
      throw new Error("Failed to list posts");
    }
  }

  public async listByRelevance(
    filters: BaseRepositoryFindManyFilters,
    userId: number
  ): Promise<BaseRepositoryFindManyResult<ViewerPost>> {
    try {
      const skip = filters.offset ?? 0;
      const take = filters.limit ?? 10;

      const searchFilter = filters.search ? `%${filters.search}%` : null;

      this.logger.log(
        `Listing posts (raw) with filters: skip=${skip}, take=${take}, search=${filters.search ?? "none"}`
      );

      const whereSearch = searchFilter
        ? `WHERE (p.title LIKE ? OR p.content LIKE ?)`
        : "";

      const params = searchFilter
        ? [userId, searchFilter, searchFilter, take, skip]
        : [userId, take, skip];

      const relevanceOrder = `p.score * POW(0.90, DATEDIFF(CURRENT_DATE, p.published_at))`;

      const query =
        this.buildBasePostSelectQuery(whereSearch) +
        ` ORDER BY ${relevanceOrder} DESC, p.published_at DESC LIMIT ? OFFSET ?`;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const [result, countResult] = await Promise.all([
        this.prisma.$queryRawUnsafe<any>(query, ...params),
        this.prisma.$queryRawUnsafe<any>(
          `
          SELECT COUNT(*) AS total
          FROM posts p
            ${searchFilter ? "WHERE (p.title LIKE ? OR p.content LIKE ?)" : ""}
          `,
          ...(searchFilter ? [searchFilter, searchFilter] : [])
        ),
      ]);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const count = Number(countResult[0]?.total ?? 0);
      const records = PostAssembler.fromSqlMany(result, userId);

      return { records: records, count };
    } catch (error: unknown) {
      console.log(error);
      this.logger.error("Failed to list posts", { error });
      throw new Error("Failed to list posts");
    }
  }

  private buildBasePostSelectQuery(whereClause: string): string {
    return `
      SELECT  
        p.*,  
        a.name AS author_name,
        a.public_id AS author_public_id,
        a.profile_picture AS author_profile_picture,
        IF(i.id IS NOT NULL, JSON_OBJECT('id', i.id, 'image_url', i.image_url, 'incident_date', i.incident_date, 'incident_type_slug', it.slug), NULL) AS incident_obj,
        IF(v_self.user_id IS NOT NULL, JSON_OBJECT('value', v_self.value, 'user_id', v_self.user_id), NULL) AS vote_obj,
        IF(p.location IS NOT NULL, JSON_OBJECT('latitude', ST_Y(p.location), 'longitude', ST_X(p.location)), NULL) AS location_obj,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'media_id', pm.media_id,
            'display_order', pm.display_order,
            'media_caption', m.caption,
            'media_sources', m.sources
          )
        ) AS post_media_obj
      FROM posts p
        LEFT JOIN incidents i ON p.incident_id = i.id
        LEFT JOIN users ia ON i.author_id = ia.id
        LEFT JOIN incident_types it ON i.incident_type_id = it.id
        LEFT JOIN post_votes v_self ON v_self.post_id = p.id AND v_self.user_id = ?
        LEFT JOIN users a ON p.author_id = a.id
      LEFT JOIN post_medias pm ON pm.post_id = p.id
      LEFT JOIN medias m ON m.id = pm.media_id
      ${whereClause}
    `;
  }
}
