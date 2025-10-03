import { PartnerApiKeysRepository } from "@/modules/identity/auth/domain/interfaces/repositories/partner-api-keys-repository";
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";

@Injectable()
export class PartnerApiKeyGuard implements CanActivate {
  constructor(private readonly repository: PartnerApiKeysRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const apiKey =
      (request.headers["x-api-key"] as string) ||
      (request.query.api_key as string);

    if (!apiKey || typeof apiKey !== "string") {
      throw new UnauthorizedException("API key missing");
    }

    try {
      const keyExists = await this.repository.findOne(apiKey);

      if (!keyExists) {
        throw new ForbiddenException("Invalid API key");
      }

      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new Error("Internal server error");
    }
  }
}
