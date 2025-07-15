import { randomUUID } from "crypto";
import { ForbiddenException, GoneException, Injectable } from "@nestjs/common";

import {
  UserVerification,
  UserVerificationType,
} from "../../domain/entities/UserVerification";
import { UserCredential } from "../../domain/entities/UserCredential";
import { uuidv7 } from "uuidv7";
import { UserVerificationRepository } from "../../domain/interfaces/repositories/user-verification-repository";
import { EmailService } from "@/modules/shared/domain/interfaces/services/email-service";
import { generateVerificationEmailContent } from "../../domain/utils/generate-verification-email";
import { UserCredentialsRepository } from "@/modules/identity/domain/interfaces/repositories/user-credentials-repository";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { UsersRepository } from "@/modules/identity/domain/interfaces/repositories/users-repository";
import { UserRoles } from "@/modules/identity/domain/enums/user-roles";

@Injectable()
export class UserVerificationService {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly userCredentialsRepository: UserCredentialsRepository,
    private readonly userVerificationRepository: UserVerificationRepository,
    private readonly prismaService: PrismaService,
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
    const userVerification =
      await this.userVerificationRepository.findByToken(token);

    if (!userVerification) {
      throw new ForbiddenException("Token inválido");
    }

    const now = new Date();

    if (userVerification.expiresAt && userVerification.expiresAt < now) {
      throw new ForbiddenException("Token expirado");
    }

    if (userVerification.used) {
      throw new ForbiddenException("Este link já foi utilizado");
    }

    const userCredential = await this.userCredentialsRepository.findOne({
      userId: userVerification.userId,
      provider: userVerification.provider,
    });

    if (!userCredential) {
      throw new GoneException("Credencial de usuário não encontrada");
    }

    const user = await this.userRepository.findById(userCredential.userId);

    if (!user) {
      throw new GoneException("Usuário não encontrado");
    }

    userVerification.used = true;
    userVerification.verifiedAt = now;
    userVerification.attempts += 1;

    userCredential.isVerified = true;

    user.role = UserRoles.USER;

    await this.prismaService.openTransaction(async (tx) => {
      await this.userVerificationRepository.update(userVerification, tx);

      await this.userCredentialsRepository.update(userCredential, tx);

      await this.userRepository.update(user, tx);
    });
  }
}
