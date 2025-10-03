import { PartnerApiKey } from "../../../../core/domain/entities/PartnerApiKey";

export abstract class PartnerApiKeysRepository {
  abstract findOne(apiKey: string): Promise<PartnerApiKey | null>;
}
