import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { PoliciesRepository } from "../../domain/interfaces/policies-repository";
import { Policy, PolicyType } from "../../domain/entities/Policy";
import { Prisma } from "@prisma/client";

@Injectable()
export class PrismaPoliciesRepository implements PoliciesRepository {
  private readonly logger: Logger = new Logger(PrismaPoliciesRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  public async findById(id: string): Promise<Policy | null> {
    try {
      const policy = await this.prisma.policy.findUnique({ where: { id } });
      if (!policy) return null;

      return new Policy({
        id: policy.id,
        content: policy.content,
        version: policy.version,
        createdAt: policy.createdAt,
        type: policy.type as PolicyType,
        htmlContent: policy.htmlContent,
      });
    } catch (error: unknown) {
      this.logger.error("Failed to ", { error });
      throw new Error("Failed to ");
    }
  }

  public async findLatestPolicies(): Promise<Policy[]> {
    try {
      const policies = await this.prisma.$queryRaw<
        Array<Policy & { rn: number }>
      >(Prisma.sql`
          SELECT p.*
            FROM policies AS p
            JOIN (
              SELECT
                type,
                MAX(CONCAT(
                  LPAD(CAST(SUBSTRING_INDEX(version, '.', 1) AS UNSIGNED), 10, '0'),
                  LPAD(CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(version, '.', 2), '.', -1) AS UNSIGNED), 10, '0'),
                  LPAD(CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(version, '.', 3), '.', -1) AS UNSIGNED), 10, '0')
                )) AS max_key
              FROM policies
              WHERE deletedAt IS NULL
              GROUP BY type
            ) AS t
              ON p.type = t.type
            AND CONCAT(
                  LPAD(CAST(SUBSTRING_INDEX(p.version, '.', 1) AS UNSIGNED), 10, '0'),
                  LPAD(CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(p.version, '.', 2), '.', -1) AS UNSIGNED), 10, '0'),
                  LPAD(CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(p.version, '.', 3), '.', -1) AS UNSIGNED), 10, '0')
                ) = t.max_key
            WHERE p.deletedAt IS NULL;
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
