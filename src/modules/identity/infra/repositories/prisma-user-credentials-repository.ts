import { PrismaService } from "@/modules/shared/services/prisma-services";
import { UserCredentialsRepository } from "../../domain/interfaces/repositories/user-credentials-repository";
import { Inject, Logger } from "@nestjs/common";
import { UserCredential } from "../../domain/entities/UserCredential";
import { PrismaClient } from "@prisma/client";

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
          userId: userCredential.userId!,
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
}
