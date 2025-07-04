import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { UserPolicyAgreementsRepository } from "../../domain/interfaces/user-policy-agreements-repository";
import { UserPolicyAgreement } from "../../domain/entities/UserPolicyAgreement";

@Injectable()
export class PrismaUserPolicyAgreementsRepository
  implements UserPolicyAgreementsRepository
{
  private readonly logger: Logger = new Logger(
    PrismaUserPolicyAgreementsRepository.name
  );

  constructor(private readonly prisma: PrismaService) {}

  public async delete(userId: number, policyId: string): Promise<void> {
    try {
      await this.prisma.userPolicyAgreement.update({
        where: { userId_policyId: { policyId, userId } },
        data: { deletedAt: new Date() },
      });
    } catch (error: unknown) {
      this.logger.error("Failed to ", { error });
      throw new Error("Failed to ");
    }
  }

  public async findOneByUserIdWithPolicyId(
    userId: number,
    policyId: string
  ): Promise<UserPolicyAgreement | null> {
    try {
      const result = await this.prisma.userPolicyAgreement.findUnique({
        where: { userId_policyId: { policyId, userId }, deletedAt: null },
      });

      if (!result) return null;

      return new UserPolicyAgreement({
        userId: result.userId,
        policyId: result.policyId,
        ipAddress: result.ipAddress,
        userAgent: result.userAgent,
        consentedAt: result.consentedAt,
        policyContentHash: result.policyContentHash,
      });
    } catch (error: unknown) {
      this.logger.error("Failed to ", { error });
      throw new Error("Failed to ");
    }
  }

  public async findManyByUserIdWithPolicyIds(
    userId: number,
    policyIds: string[]
  ): Promise<UserPolicyAgreement[]> {
    try {
      const result = await this.prisma.userPolicyAgreement.findMany({
        where: { userId, policyId: { in: policyIds }, deletedAt: null },
      });

      if (!result.length) return [];

      return result.map(
        (agreement) =>
          new UserPolicyAgreement({
            userId: agreement.userId,
            policyId: agreement.policyId,
            ipAddress: agreement.ipAddress,
            userAgent: agreement.userAgent,
            consentedAt: agreement.consentedAt,
            policyContentHash: agreement.policyContentHash,
          })
      );
    } catch (error: unknown) {
      this.logger.error("Failed to ", { error });
      throw new Error("Failed to ");
    }
  }

  public async add(agreement: UserPolicyAgreement): Promise<void> {
    try {
      await this.prisma.userPolicyAgreement.create({
        data: {
          userId: agreement.userId,
          policyId: agreement.policyId,
          ipAddress: agreement.ipAddress,
          userAgent: agreement.userAgent,
          consentedAt: agreement.consentedAt,
          policyContentHash: agreement.policyContentHash,
        },
      });
    } catch (error: unknown) {
      this.logger.error("Failed to ", { error });
      throw new Error("Failed to ");
    }
  }

  public async upsert(agreement: UserPolicyAgreement): Promise<void> {
    try {
      await this.prisma.userPolicyAgreement.upsert({
        where: {
          userId_policyId: {
            policyId: agreement.policyId,
            userId: agreement.userId,
          },
        },
        create: {
          userId: agreement.userId,
          policyId: agreement.policyId,
          ipAddress: agreement.ipAddress,
          userAgent: agreement.userAgent,
          consentedAt: agreement.consentedAt,
          policyContentHash: agreement.policyContentHash,
        },
        update: {
          ipAddress: agreement.ipAddress,
          userAgent: agreement.userAgent,
          consentedAt: agreement.consentedAt,
          policyContentHash: agreement.policyContentHash,
        },
      });
    } catch (error: unknown) {
      this.logger.error("Failed to ", { error });
      throw new Error("Failed to ");
    }
  }
}
