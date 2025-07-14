import { PrismaClient } from "@prisma/client";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { Inject, Logger } from "@nestjs/common";
import { UserVerificationRepository } from "../domain/interfaces/repositories/user-verification-repository";
import { UserVerification } from "../domain/entities/UserVerification";
import { AuthProviders } from "../../domain/enums/auth-provider";

export class PrismaUserVerificationRepository
  implements UserVerificationRepository
{
  private readonly logger: Logger = new Logger(
    PrismaUserVerificationRepository.name
  );

  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService
  ) {}

  public async findByToken(token: string): Promise<UserVerification | null> {
    try {
      this.logger.log(`Adding user Verification`, { token });

      const result = await this.prisma.userVerification.findFirst({
        where: { token },
      });

      if (!result) return null;

      return new UserVerification({
        id: result.id,
        email: result.email,
        token: result.token,
        expiresAt: result.expiresAt,
        provider: result.provider as AuthProviders,
        userId: result.userId,
      });
    } catch (error: unknown) {
      this.logger.error(`Failed to add user Credentials`, {
        error,
      });
      throw new Error("Error adding user");
    }
  }

  public async add(
    userVerification: UserVerification,
    tx: PrismaClient
  ): Promise<void> {
    try {
      const prisma = this.prisma.getConnection() ?? tx;
      this.logger.log(`Adding user Verification`, { userVerification });

      await prisma.userVerification.create({
        data: {
          id: userVerification.id,
          email: userVerification.email,
          token: userVerification.token,
          expiresAt: userVerification.expiresAt,
          provider: userVerification.provider,
          userId: userVerification.userId,
        },
      });
    } catch (error: unknown) {
      this.logger.error(`Failed to add user Credentials`, {
        userVerification,
        error,
      });
      throw new Error("Error adding user");
    }
  }
}
