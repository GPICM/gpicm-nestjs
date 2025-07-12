import { Controller, Query, Get, Logger, BadRequestException } from "@nestjs/common";
import { VerifyEmailUse } from "../application/verify-email.use";

@Controller("verificar-email")
export class GuestAuthController {
  private readonly logger = new Logger(GuestAuthController.name);

  constructor(private readonly verifyEmailUse: VerifyEmailUse) {}

  @Get("/verificacao-email")
  async emailVerification(@Query("token") token: string): Promise<{ success: boolean }> {
    if (!token) {
      throw new BadRequestException("Token não fornecido");
    }

    try {
      await this.verifyEmailUse.execute(token);
      return { success: true };
    } catch (error) {
      this.logger.error("Falha ao verificar o e-mail", error instanceof Error ? error.stack : String(error));
      throw new BadRequestException("Erro ao verificar o e-mail");
    }
  }
}
