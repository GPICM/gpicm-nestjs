import { Request } from "express";
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";

import { User } from "@/modules/identity/domain/entities/User";

@Injectable()
export class UserGuard implements CanActivate {
  constructor() {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as User;

    if (!user) {
      throw new ForbiddenException("User is required");
    }

    if (!user.isUser()) {
      throw new ForbiddenException("Verified User role is required");
    }

    return true;
  }
}
