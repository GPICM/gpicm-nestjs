import { PrismaClient } from "@prisma/client";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { Inject, Logger } from "@nestjs/common";
import { UserVerificationRepository } from "../domain/interfaces/repositories/user-verification-repository";
import {
  UserVerification,
  UserVerificationType,
} from "../domain/entities/UserVerification";
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
        used: result.used,
        email: result.email,
        token: result.token,
        userId: result.userId,
        attempts: result.attempts,
        expiresAt: result.expiresAt,
        verifiedAt: result.verifiedAt,
        ipAddress: result.ipAddress || "",
        userAgent: result.userAgent || "",
        provider: result.provider as AuthProviders,
        type: result.type as UserVerificationType,
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
          type: userVerification.type,
          used: userVerification.used,
          email: userVerification.email,
          token: userVerification.token,
          expiresAt: userVerification.expiresAt,
          provider: userVerification.provider,
          userId: userVerification.userId,
          attempts: userVerification.attempts,
          ipAddress: userVerification.ipAddress,
          userAgent: userVerification.userAgent,
          verifiedAt: userVerification.verifiedAt,
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
