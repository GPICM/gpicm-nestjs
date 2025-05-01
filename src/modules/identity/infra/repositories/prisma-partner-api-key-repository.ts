import { Inject, Logger } from "@nestjs/common";

import { PrismaService } from "@/modules/shared/services/prisma-services";

import { PartnerApiKeysRepository } from "../../domain/interfaces/repositories/partner-api-keys-repository";
import { PartnerApiKey } from "../../domain/entities/PartnerApiKey";

export class PrismaPartnerApiKeysRepository
  implements PartnerApiKeysRepository
{
  private readonly logger: Logger = new Logger(
    PrismaPartnerApiKeysRepository.name
  );

  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService
  ) {}

  async findOne(apiKey: string): Promise<PartnerApiKey | null> {
    const partnerApiKey = await this.prisma.partnerApiKey.findUnique({
      where: { key: apiKey },
    });

    if (!partnerApiKey) {
      return null;
    }

    return new PartnerApiKey({
      id: partnerApiKey.id,
      key: partnerApiKey.key,
      partnerId: partnerApiKey.partnerId,
    });
  }
}
