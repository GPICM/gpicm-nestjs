import { PrismaService } from "@/modules/shared/services/prisma-services";

import { Inject, Logger } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { UserLogsRepository } from "../../domain/interfaces/repositories/user-logs-repository";
import { UserLog } from "../../domain/entities/UserLog";

export class PrismaUserLogsRepository implements UserLogsRepository {
  private readonly logger: Logger = new Logger(PrismaUserLogsRepository.name);

  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService
  ) {}

  public async add(userLog: UserLog, tx?: PrismaClient): Promise<void> {
    try {
      const connection = this.prisma.getConnection() ?? tx;
      this.logger.log(`Adding new UserLog`, { userLog });

      await connection.userLog.create({
        data: {
          action: userLog.action,
          message: userLog.message,
          userId: userLog.userId,
        },
      });
    } catch (error: unknown) {
      this.logger.error(`Failed to add new user log`, {
        error,
      });
      throw new Error("Error adding user log");
    }
  }
}
