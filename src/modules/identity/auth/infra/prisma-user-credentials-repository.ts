import { PrismaService } from "@/modules/shared/services/prisma-services";
import { Inject, Logger } from "@nestjs/common";
import { UserCredential } from "../domain/entities/UserCredential";
import { PrismaClient } from "@prisma/client";
import { AuthProviders } from "../../core/domain/enums/auth-provider";
import { UserCredentialsRepository } from "../domain/interfaces/repositories/user-credentials-repository";

export class PrismaUserCredentialsRepository
  implements UserCredentialsRepository
{
  private readonly logger: Logger = new Logger(
    PrismaUserCredentialsRepository.name
  );

  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService
  ) {}

  public async findOne(
    filters: { userId: number; provider: AuthProviders },
    tx?: unknown
  ): Promise<UserCredential | null> {
    try {
      const prisma = this.prisma.getConnection() ?? tx;

      const record = await prisma.userCredential.findUnique({
        where: {
          userId_provider: {
            userId: filters.userId,
            provider: filters.provider,
          },
        },
      });

      if (!record) return null;

      return new UserCredential({
        userId: record.userId,
        email: record.email,
        isPrimary: record.isPrimary,
        isVerified: record.isVerified,
        externalId: record.externalId ?? null,
        provider: record.provider as AuthProviders,
        lastPasswordChangeAt: record.lastPasswordChangeAt,
        temporaryPasswordExpiresAt: null,
        temporaryPasswordHash: null,
        passwordHash: null,
      });
    } catch (error: unknown) {
      this.logger.error("Failed to find user credential", { filters, error });
      throw new Error("Error finding user credential");
    }
  }

  public async add(
    userCredential: UserCredential,
    tx: PrismaClient
  ): Promise<void> {
    try {
      const prisma = this.prisma.getConnection() ?? tx;
      this.logger.log(`Adding user Credentials`, { userCredential });

      await prisma.userCredential.create({
        data: {
          email: userCredential.email,
          provider: userCredential.provider,
          userId: userCredential.userId,
          externalId: userCredential.externalId,
          isPrimary: userCredential.isPrimary,
          passwordHash: userCredential.passwordHash,
        },
      });
    } catch (error: unknown) {
      this.logger.error(`Failed to add user Credentials`, {
        userCredential,
        error,
      });
      throw new Error("Error adding user");
    }
  }

  public async update(user: UserCredential, tx?: unknown): Promise<void> {
    try {
      const prisma = this.prisma.getConnection() ?? tx;

      await prisma.userCredential.update({
        where: {
          userId_provider: {
            userId: user.userId,
            provider: user.provider,
          },
        },
        data: {
          isVerified: user.isVerified ?? undefined,
          isPrimary: user.isPrimary,
          externalId: user.externalId,
          email: user.email,
        },
      });
    } catch (error: unknown) {
      this.logger.error("Failed to update user credential", { user, error });
      throw new Error("Error updating user credential");
    }
  }
}
