import { Inject, Logger } from "@nestjs/common";
import { UserLogsRepository } from "../domain/interfaces/repositories/user-logs-repository";
import { UserLog } from "../domain/entities/UserLog";

export class LogUserAction {
  private readonly logger: Logger = new Logger(LogUserAction.name);

  constructor(
    @Inject(UserLogsRepository)
    private readonly userLogsRepository: UserLogsRepository
  ) {}

  public async execute(
    userId: number,
    action: string,
    message?: string
  ): Promise<void> {
    try {
      const userLog = new UserLog({
        action,
        message: message ?? "",
        userId,
      });
      await this.userLogsRepository.add(userLog);
    } catch (error: unknown) {
      this.logger.error("Failed to store user action", { error });
    }
  }
}
