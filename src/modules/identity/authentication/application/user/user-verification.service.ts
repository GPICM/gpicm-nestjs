import { randomUUID } from "crypto";
import { Injectable } from "@nestjs/common";

import {
  UserVerification,
  UserVerificationType,
} from "../../domain/entities/UserVerification";
import { UserCredential } from "../../domain/entities/UserCredential";
import { uuidv7 } from "uuidv7";
import { UserVerificationRepository } from "../../domain/interfaces/repositories/user-verification-repository";
import { EmailService } from "@/modules/shared/domain/interfaces/services/email-service";
import { generateVerificationEmailContent } from "../../domain/utils/generate-verification-email";

@Injectable()
export class UserVerificationService {
  constructor(
    private readonly userVerificationRepository: UserVerificationRepository,
    private readonly emailService: EmailService
  ) {}

  async startUserVerification(
    userCredential: UserCredential,
    tx: unknown
  ): Promise<void> {
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 2); // 2h

    const userVerification = new UserVerification({
      token,
      expiresAt,
      id: uuidv7(),
      email: userCredential.email,
      userId: userCredential.userId,
      provider: userCredential.provider,
      attempts: 0,
      used: false,
      ipAddress: "",
      userAgent: "",
      verifiedAt: null,
      type: UserVerificationType.EMAIL_VERIFICATION,
    });

    await this.userVerificationRepository.add(userVerification, tx);

    const link = `${String(process.env.FRONT_END_URL)}/verify-email?token=${token}`;
    const { html, text } = generateVerificationEmailContent(link);

    await this.emailService.sendEmail({
      html,
      text,
      subject: "Confirme seu e-mail",
      to: userVerification.email,
    });
  }

  async verifyToken(token: string): Promise<void> {
    // todo: Validar token de User Verifications
  }
}
