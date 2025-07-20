import { Inject, Logger } from "@nestjs/common";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import {
  BaseRepositoryFindManyResult,
  PostFindManyFilters,
  PostRepository,
} from "../domain/interfaces/repositories/post-repository";
import { Post } from "../domain/entities/Post";
import { PrismaClient } from "@prisma/client";
import { PostAssembler } from "./mappers/post.assembler";
import { ViewerPost } from "../domain/entities/ViewerPost";
import { PostSortBy } from "../domain/enum/OrderBy";

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
        `${this.buildBasePostSelectQuery(["p.slug = ?"])} GROUP BY p.id`,
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
        `${this.buildBasePostSelectQuery(["p.uuid = ?"])} GROUP BY p.id`,
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

  public async listMine(
    filters: BaseRepositoryFindManyFilters,
    userId: number
  ): Promise<BaseRepositoryFindManyResult<ViewerPost>> {
    try {
      const skip = filters.offset ?? 0;
      const take = filters.limit ?? 10;
      const sort = filters.sort ?? "published_at";
      const order = filters.order?.toUpperCase() === "ASC" ? "ASC" : "DESC";

      this.logger.log(
        `Listing posts by user ${userId} with filters: offset=${skip}, limit=${take}, sort=${sort}, order=${order}`
      );

      const query =
        this.buildBasePostSelectQuery(`WHERE p.author_id = ?`) +
        ` ORDER BY p.${sort} ${order} LIMIT ? OFFSET ?`;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const [result, countResult] = await Promise.all([
        await this.prisma.$queryRawUnsafe<any>(
          query,
          userId,
          userId,
          take,
          skip
        ),
        await this.prisma.$queryRawUnsafe<any>(
          `SELECT COUNT(*) AS total FROM posts p WHERE p.author_id = ?`,
          userId
        ),
      ]);

      const records = PostAssembler.fromSqlMany(result, userId);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const count = Number(countResult[0]?.total ?? 0);

      return { records, count };
    } catch (error: unknown) {
      this.logger.error("Failed to list user's posts", { error });
      throw new Error("Failed to list user's posts");
    }
  }

  public async listAll(
    filters: PostFindManyFilters,
    userId: number
  ): Promise<BaseRepositoryFindManyResult<ViewerPost>> {
    try {
      this.logger.log("Staging to list posts", { filters });
      const skip = filters.offset ?? 0;
      const take = filters.limit ?? 10;

      const order = filters.order?.toUpperCase() === "ASC" ? "ASC" : "DESC";

      const whereClauses: string[] = [];
      const searchParams: (string | number)[] = [];

      if (filters.search) {
        const searchFilter = `%${filters.search}%`;
        whereClauses.push("(p.title LIKE ? OR p.content LIKE ?)");
        searchParams.push(searchFilter, searchFilter);
      }

      if (filters.tags?.length) {
        const placeholders = filters.tags.map(
          (v) => `JSON_CONTAINS(tags, '["${v}"]')`
        );
        whereClauses.push(placeholders.join(" OR "));
      }

      if (filters.startDate && filters.endDate) {
        whereClauses.push("(p.published_at BETWEEN ? AND ?)");
        searchParams.push(
          filters.startDate.toISOString(),
          filters.endDate.toISOString()
        );
      }

      this.logger.log(
        `Listing posts with filters: skip=${skip}, take=${take}, order=${order}, search=${filters.search ?? "none"}`
      );

      const orderByClause = this.getOrderByClause(
        filters.sortBy ?? PostSortBy.NEWEST
      );

      const query =
        this.buildBasePostSelectQuery(whereClauses) +
        ` ORDER BY ${orderByClause} LIMIT ? OFFSET ?`;

      const countQuery = `SELECT COUNT(*) AS total FROM posts p ${this.joinWhereCauses(whereClauses)}`;

      const queryParams = [userId, ...searchParams, take, skip];
      const countQueryParams = [...searchParams];

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const [result, countResult] = await Promise.all([
        this.prisma.$queryRawUnsafe<any>(query, ...queryParams),
        this.prisma.$queryRawUnsafe<any>(countQuery, ...countQueryParams),
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

  private getOrderByClause(sortBy: PostSortBy): string {
    switch (sortBy) {
      case PostSortBy.NEWEST:
        return `p.published_at DESC`;
      case PostSortBy.OLDEST:
        return `p.published_at ASC`;
      case PostSortBy.MOST_POPULAR:
        // Por exemplo, score decrescente com decaimento por data
        return `p.score * POW(0.90, DATEDIFF(CURRENT_DATE, p.published_at)) DESC`;
      case PostSortBy.LEAST_POPULAR:
        return `p.score ASC`;
      case PostSortBy.MOST_COMMENTED:
        return `p.comments_count DESC`;
      case PostSortBy.LEAST_COMMENTED:
        return `p.comments_count ASC`;
      case PostSortBy.MOST_LIKED:
        return `p.up_votes DESC`;
      case PostSortBy.LEAST_LIKED:
        return `p.up_votes ASC`;
      case PostSortBy.TITLE_ASC:
        return `p.title ASC`;
      case PostSortBy.TITLE_DESC:
        return `p.title DESC`;
      default:
        return `p.published_at DESC`; // padrão
    }
  }

  private buildBasePostSelectQuery(whereClauses: string[]): string {
    const where = this.joinWhereCauses(whereClauses);

    return `
    SELECT  
      p.*,  
      a.name AS author_name,
      a.public_id AS author_public_id,
      a.avatar_url AS author_avatar_url,
      IF(i.id IS NOT NULL, JSON_OBJECT('id', i.id, 'incident_date', i.incident_date, 'incident_type_slug', it.slug), NULL) AS incident_obj,
      IF(v_self.user_id IS NOT NULL, JSON_OBJECT('value', v_self.value, 'user_id', v_self.user_id), NULL) AS vote_obj,
      IF(p.location IS NOT NULL, JSON_OBJECT('latitude', ST_Y(p.location), 'longitude', ST_X(p.location)), NULL) AS location_obj
    FROM posts p
      LEFT JOIN incidents i ON p.incident_id = i.id
      LEFT JOIN incident_types it ON i.incident_type_id = it.id
      LEFT JOIN post_votes v_self ON v_self.post_id = p.id AND v_self.user_id = ?
      LEFT JOIN users a ON p.author_id = a.id
    ${where}
  `;
  }

  private joinWhereCauses(whereClauses: string[]): string {
    const where = whereClauses.length
      ? `WHERE ${whereClauses.join(" AND ")}`
      : "";

    this.logger.log("sql", { where });

    return where;
  }
}
