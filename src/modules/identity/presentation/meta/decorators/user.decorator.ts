// src/decorators/user-id.decorator.ts
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";
import { User } from "../../../domain/entities/User";
import { Guest } from "../../../domain/entities/Guest";

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User | null => {
    const request: Request = ctx.switchToHttp().getRequest();

    const user = (request.user ?? null) as User | null;
    return user;
  }
);

export const GuestUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Guest | null => {
    const request: Request = ctx.switchToHttp().getRequest();

    const user = (request.user ?? null) as User | null;
    if (!user) return null;

    return new Guest(user);
  }
);
