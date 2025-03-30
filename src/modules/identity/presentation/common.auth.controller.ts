import {
  UnauthorizedException,
  Controller,
  UseGuards,
  Logger,
  Get,
  Post,
  Ip,
  Body,
} from "@nestjs/common";

import { CurrentUser } from "./meta/decorators/user.decorator";
import { JwtAuthGuard } from "./meta";
import { User } from "../domain/entities/User";
import { SignUpRequestBodyDto } from "./dtos/guest-auth-request.dtos";
import { AuthenticationService } from "../application/authentication.service";

@Controller("identity")
export class CommonAuthController {
  private readonly logger = new Logger(CommonAuthController.name);

  public constructor(
    private readonly authenticationService: AuthenticationService
  ) {}

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

  @Post("/signup")
  async signUp(
    @Ip() ipAddress: string,
    @Body() body: SignUpRequestBodyDto
  ): Promise<any> {
    try {
      this.logger.log("Started guest upgrade ", { ipAddress, body });
      const result = await this.authenticationService.signUp({
        email: body.email,
        name: body.name,
        password: body.password,
        deviceKey: body.deviceKey,
      });
      return result;
    } catch (error: unknown) {
      this.logger.error("Failed to signIn Guest", { error });
      throw new UnauthorizedException();
    }
  }
}
