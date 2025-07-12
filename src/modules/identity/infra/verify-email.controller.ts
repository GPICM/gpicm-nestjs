import { Controller, Query, Res, Get } from "@nestjs/common";
import { Response } from "express";
import { EmailVerificationService } from "../application/email-verification.service";
import { VerifyEmailUse } from "../application/verify-email.use";

@Controller("verify-email")
export class VerifyEmailController {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
    private readonly useCase: VerifyEmailUse
  ) {}

  @Get()
  async handle(@Query("token") token: string, @Res() res: Response) {
    try {
      await this.useCase.execute(token);
      return res.redirect("/email-verificado-com-sucesso"); // rota front-end
    } catch (error) {
      console.error("Erro ao verificar e-mail:", error);
      return res.redirect("/erro-na-verificacao-de-email"); // rota front-end
    }
  }
}
