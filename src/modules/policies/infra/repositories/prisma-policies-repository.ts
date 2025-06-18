import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { PoliciesRepository } from "../../domain/interfaces/policies-repository";
import { Policies, PolicyType } from "../../domain/entities/policies";
import { computeContentHash } from "@/modules/shared/utils/hash-utils";

@Injectable()
export class PrismaPoliciesRepository implements PoliciesRepository {
  private readonly logger: Logger = new Logger(PrismaPoliciesRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  public async getPoliciesByType(type: PolicyType): Promise<Policies[]> {
    try {
      const policies = await this.prisma.policy.findMany({
        where: { type },
        orderBy: { createdAt: "desc" },
      });

      return policies.map((policy) => ({
        ...policy,
        type: policy.type as PolicyType,
      }));
    } catch (error: unknown) {
      this.logger.error("Failed to ", { error });
      throw new Error("Failed to ");
    }
  }

  async getUserAgreementVersion(userId: number): Promise<string | null> {
    const agreement = await this.prisma.userAgreement.findFirst({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: { consentedAt: "desc" },
    });
    return agreement?.policyVersion ?? null;
  }

  async getUserAgreementHash(userId: number): Promise<string | null> {
    const agreement = await this.prisma.userAgreement.findFirst({
      where: {
        userId,
        deletedAt: null,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return agreement?.contentHash ?? null;
  }

  async getLatestPolicyVersion(type: PolicyType): Promise<string | null> {
    const latestPolicy = await this.prisma.policy.findFirst({
      where: { type, deletedAt: null },
    });
    return latestPolicy?.version ?? null;
  }

  async getLatestPolicyContent(type: PolicyType): Promise<string | null> {
    const policy = await this.prisma.policy.findFirst({
      where: { type, deletedAt: null },
    });
    return policy?.content ?? null;
  }

  async acceptUserAgreement(
    userId: number,
    type: PolicyType,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const latestPolicy = await this.prisma.policy.findFirst({
      where: { type, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });

    if (!latestPolicy) {
      throw new Error(`No active policy found for type ${type}`);
    }

    const contentHash = computeContentHash(latestPolicy.content);

    const existingAgreement = await this.prisma.userAgreement.findFirst({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: { consentedAt: "desc" },
    });

    const agreementData = {
      policyVersion: latestPolicy.version,
      contentHash,
      consentedAt: new Date(),
      ...(ipAddress && { ipAddress }),
      ...(userAgent && { userAgent }),
    };

    if (existingAgreement) {
      await this.prisma.userAgreement.update({
        where: { id: existingAgreement.id },
        data: agreementData,
      });
    } else {
      await this.prisma.userAgreement.create({
        data: {
          userId,
          ...agreementData,
        },
      });
    }
  }
}
