import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Request } from "express";
import { User } from "../../domain/entities/User";

@Injectable()
export class GuestGuard implements CanActivate {
  constructor() {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as User;

    if (!user) {
      throw new ForbiddenException("User is required");
    }

    if (!user.isGuest()) {
      throw new ForbiddenException("Guest roles is required");
    }

    return true;
  }
}
