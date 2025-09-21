/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request } from "express";

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import { ProfileRepository } from "@/modules/social/core/domain/interfaces/repositories/profile-repository";
import { User } from "@/modules/identity/domain/entities/User";

@Injectable()
export class SocialProfileGuard implements CanActivate {
  private readonly logger = new Logger();
  constructor(private readonly profileRepository: ProfileRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.log("Validation profile");
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as User;

    if (!user || !user.id) {
      throw new UnauthorizedException("User not authenticated.");
    }

    const profile = await this.profileRepository.findByUserId(user.id);

    if (!profile) {
      throw new ForbiddenException("User does not have a profile.");
    }

    request.profile = profile;
    return true;
  }
}
