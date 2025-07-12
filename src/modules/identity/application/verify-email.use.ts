import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/modules/shared/services/prisma-services";

@Injectable()
export class VerifyEmailUse {
  constructor(private readonly prisma: PrismaService) {}

  async execute(token: string): Promise<void> {
    const record = await this.prisma.userCredential.findUnique({
      where: { emailVerificationToken: token
        },
    });

    if (!record || !record.expiresAt || record.expiresAt < new Date()) {
      throw new Error("Token inválido ou expirado");
    }

    await this.prisma.userCredential.update({
      where: { emailVerificationToken: token },
      data: { emailIsVerified: true },
    });

    await this.prisma.userCredential.update({
      where: { emailVerificationToken: token },
      data: { emailVerificationToken: null },
    });
  }
}
