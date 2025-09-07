import {
  Controller,
  Logger,
  BadRequestException,
  Post,
  Body,
} from "@nestjs/common";
import { UserVerificationService } from "../application/user/user-verification.service";

@Controller("identity/user-verification")
export class UserVerificationController {
  private readonly logger = new Logger(UserVerificationController.name);

  constructor(
    private readonly userVerificationService: UserVerificationService
  ) {}

  @Post("/email")
  async emailVerification(
    @Body("token") token: string
  ): Promise<{ success: boolean }> {
    if (!token) {
      throw new BadRequestException("Token not found");
    }

    try {
      await this.userVerificationService.verifyToken(token);

      return { success: true };
    } catch (error) {
      this.logger.error(
        "Falha ao verificar o e-mail",
        error instanceof Error ? error.stack : String(error)
      );
      throw error;
    }
  }
}
