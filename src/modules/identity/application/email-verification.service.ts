import { Injectable } from "@nestjs/common";
import { v4 as uuid } from "uuid";
import { User } from "../domain/entities/User";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { EmailService } from "@/modules/shared/services/email-service";
import { AuthProviders } from "../domain/enums/auth-provider";
import { Prisma } from "@prisma/client";

@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService
  ) {}

  async sendVerificationEmail(user: User) {
    let data: Prisma.UserCredentialCreateInput;

    const token = uuid();

    const credential = user.getCredential(AuthProviders.EMAIL_PASSWORD);
    const email = credential?.email ?? "";
    const provider = AuthProviders.EMAIL_PASSWORD;

    await this.prisma.userCredential.create({
      data: {
        userId: user.id!,
        emailVerificationToken: token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2h
        email,
        provider,
      },
    });

    const link = `${String(process.env.FRONT_END_URL)}/verificar-email?token=${token}`;

    await this.emailService.sendEmail({
      to: email, 
      subject: "Confirme seu e-mail",
      text: `Por favor, verifique seu e-mail clicando no link: ${link}`,
    });
  }
}
