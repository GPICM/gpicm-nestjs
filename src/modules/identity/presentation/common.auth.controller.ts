import {
  UnauthorizedException,
  Controller,
  UseGuards,
  Logger,
  Get,
} from "@nestjs/common";

import { CurrentUser } from "./meta/decorators/user.decorator";
import { JwtAuthGuard } from "./meta";
import { User } from "../domain/entities/User";

@Controller("identity")
export class CommonAuthController {
  private readonly logger = new Logger(CommonAuthController.name);

  @Get("/me")
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: User): User {
    try {
      return user;
    } catch (error: unknown) {
      this.logger.error("Failed to signIn Guest", { error });
      throw new UnauthorizedException();
    }
  }
}
