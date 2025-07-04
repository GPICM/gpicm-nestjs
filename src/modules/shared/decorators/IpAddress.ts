/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export const IpAddress = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const forwardedFor = (request as Request).headers[
      "x-forwarded-for"
    ] as string;

    return forwardedFor
      ? forwardedFor.split(",")[0]
      : (request as Request).socket.remoteAddress;
  },
);
