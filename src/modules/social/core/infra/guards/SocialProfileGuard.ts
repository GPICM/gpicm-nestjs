import { Request } from "express";
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
  ForbiddenException,
  mixin,
  Type,
} from "@nestjs/common";
import { ProfileRepository } from "@/modules/social/core/domain/interfaces/repositories/profile-repository";
import { User } from "@/modules/identity/core/domain/entities/User";

export function SocialProfileGuard(options?: {
  optional?: boolean;
}): Type<CanActivate> {
  @Injectable()
  class MixinSocialProfileGuard implements CanActivate {
    private readonly logger = new Logger(MixinSocialProfileGuard.name);

    constructor(private readonly profileRepository: ProfileRepository) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      this.logger.log(`Validating profile`, { options });

      const { optional: isProfileOptional = false } = options ?? {};

      const request = context.switchToHttp().getRequest<Request>();
      const user = request.user as User;

      if (!user || !user.id) {
        throw new UnauthorizedException("User not authenticated.");
      }

      const profile = await this.profileRepository.findByUserId(user.id);

      if (!profile) {
        if (!isProfileOptional) {
          throw new ForbiddenException("User does not have a profile.");
        }
        this.logger.debug("No profile found, continuing anyway (optional).");
        request.profile = null;
        return true;
      }

      request.profile = profile;
      return true;
    }
  }

  return mixin(MixinSocialProfileGuard);
}
