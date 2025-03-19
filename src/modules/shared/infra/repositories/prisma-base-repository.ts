/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Sql } from "@prisma/client/runtime/library";
import { PrismaService } from "../../services/prisma-services";
import { Prisma } from "@prisma/client";

export class PrismaBaseRepository<TModel> {
  protected prisma: PrismaService;

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  protected async _findOne(
    query: TemplateStringsArray | Sql,
    params: any[]
  ): Promise<TModel | null> {
    const finalQuery = Prisma.sql`${query} AND deletedAt IS NULL AND LIMIT 1`;
    const result = await this.prisma.$queryRaw<TModel[]>(finalQuery, ...params);
    return result?.length ? result[0] : null;
  }

  protected async _findMany(
    query: TemplateStringsArray | Sql,
    params: any[]
  ): Promise<TModel[]> {
    const finalQuery = Prisma.sql`${query} AND deletedAt IS NULL`;
    return this.prisma.$queryRaw<TModel[]>(finalQuery, ...params);
  }

  protected async _create(
    query: TemplateStringsArray | Sql,
    params: any[]
  ): Promise<TModel> {
    const result = await this.prisma.$queryRaw<TModel>(query, ...params);
    return result[0];
  }

  protected async _update(
    query: TemplateStringsArray | Sql,
    params: any[]
  ): Promise<TModel> {
    const result = await this.prisma.$queryRaw<TModel>(query, ...params);
    return result[0];
  }

  protected async _softDelete(
    tableName: string,
    id: string | number
  ): Promise<TModel> {
    const result = await this.prisma.$queryRaw<TModel[]>(
      Prisma.sql`
      UPDATE ${tableName}
      SET deletedAt = NOW()
      WHERE id = $1
      RETURNING *;
    `,
      id
    );

    return result[0];
  }

  protected async _hardDelete(
    query: TemplateStringsArray | Sql,
    params: any[]
  ): Promise<TModel> {
    const result = await this.prisma.$queryRaw<TModel>(query, ...params);
    return result[0];
  }
}
