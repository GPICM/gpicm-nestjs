import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { PoliciesRepository } from "../../domain/interfaces/policies-repository";
import { Policy } from "../../domain/entities/Policy";
import { Prisma } from "@prisma/client";

@Injectable()
export class PrismaPoliciesRepository implements PoliciesRepository {
  private readonly logger: Logger = new Logger(PrismaPoliciesRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  public async findLatestPolicies(): Promise<Policy[]> {
    try {
      const policies = await this.prisma.$queryRaw<
        Array<Policy & { rn: number }>
      >(Prisma.sql`
          SELECT p.*
          FROM policies AS p
          JOIN (
            SELECT type, MAX(string_to_array(version, '.')::int[]) AS max_ver_arr
            FROM policies
            WHERE "deletedAt" IS NULL
            GROUP BY type
          ) AS t
            ON p.type = t.type
          AND string_to_array(p.version, '.')::int[] = t.max_ver_arr
          WHERE p."deletedAt" IS NULL;
      `);

      if (!policies.length) return [];

      return policies.map(
        (policy) =>
          new Policy({
            id: policy.id,
            type: policy.type,
            content: policy.content,
            version: policy.version,
            createdAt: policy.createdAt,
            htmlContent: policy.htmlContent,
          })
      );
    } catch (error: unknown) {
      this.logger.error("Failed to ", { error });
      throw new Error("Failed to ");
    }
  }
}
