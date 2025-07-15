import {
  Controller,
  Query,
  Get,
  Logger,
  BadRequestException,
} from "@nestjs/common";
import { UserVerificationService } from "../application/user/user-verification.service";

@Controller("user-verification")
export class UserVerificationController {
  private readonly logger = new Logger(UserVerificationController.name);

  constructor(
    private readonly userVerificationService: UserVerificationService
  ) {}

  @Get("/email")
  async emailVerification(
    @Query("token") token: string
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
      throw new BadRequestException("Erro ao verificar o e-mail");
    }
  }
}
