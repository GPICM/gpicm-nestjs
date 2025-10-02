import { Request } from "express";
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";

import { User } from "@/modules/identity/domain/entities/User";

@Injectable()
export class ActiveUserGuard implements CanActivate {
  constructor() {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as User;

    if (!user) {
      throw new ForbiddenException("User is required");
    }

    if (user.isGuest()) {
      throw new ForbiddenException("Verified User role is required");
    }

    if (!user.isActive()) {
      throw new ForbiddenException("active user is required");
    }

    return true;
  }
}
