/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-custom";
import { Request } from "express";
import { AuthorizationService } from "../../application/authorization.service";
export const defaultJwtStrategyName = "identity-jwt";

@Injectable()
export class DefaultJwtStrategy extends PassportStrategy(
  Strategy,
  defaultJwtStrategyName,
) {
  private readonly logger = new Logger(DefaultJwtStrategy.name);

  constructor(private readonly authorizationService: AuthorizationService) {
    super();
  }

  async validate(request: Request) {
    const accessToken = this.extractAccessTokenFromRequest(request);
    try {
      if (!accessToken) {
        throw new ForbiddenException("Missing access token.");
      }

      const user = await this.authorizationService.execute(accessToken);
      if (!user) {
        throw new UnauthorizedException("User not found.");
      }

      request.user = user;
      return user;
    } catch (error: unknown) {
      console.error("Unauthorized", { error });
      throw new UnauthorizedException();
    }
  }

  private extractAccessTokenFromRequest(request: Request): string | null {
    try {
      const { headers } = request;

      const accessToken: string | null = headers.authorization
        ? headers.authorization.split(" ")[1]
        : null;

      return accessToken;
    } catch (error: unknown) {
      this.logger.error("Failed to extract accessToken from request", {
        error,
      });
      return null;
    }
  }
}
