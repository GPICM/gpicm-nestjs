import {
  Controller,
  Query,
  Logger,
  BadRequestException,
  Post,
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
    @Query("token") token: string,
    @Query("publicId") publicId: string
  ): Promise<{ success: boolean }> {
    if (!token || !publicId) {
      throw new BadRequestException("Token or PublicId not found");
    }

    try {
      await this.userVerificationService.verifyToken(token, publicId);
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
