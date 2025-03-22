import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  Ip,
  Logger,
  UseGuards,
} from "@nestjs/common";
import {
  SignInRequestBodyDto,
  SignUpRequestBodyDto,
} from "./dtos/guest-auth-request.dtos";
import { GuestAuthenticationService } from "../application/guest/guest-authentication.service";
import { CurrentUser } from "./meta/decorators/user.decorator";
import { Guest } from "../domain/entities/Guest";
import { GuestGuard, JwtAuthGuard } from "./meta";

@Controller("identity/guest/auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: GuestAuthenticationService) {}

  @Post("/signin")
  async signIn(@Ip() ipAddress: string, @Body() body: SignInRequestBodyDto) {
    try {
      this.logger.log("Started guest signin ", { ipAddress, body });
      const result = await this.authService.signIn(
        {
          captchaToken: body.captchaToken,
          deviceKey: body.deviceKey,
          ipAddress: ipAddress,
        },
        true
      );
      return result;
    } catch (error: unknown) {
      this.logger.error("Failed to signIn Guest", { error });
      throw new UnauthorizedException();
    }
  }

  @Post("/upgrade")
  @UseGuards(JwtAuthGuard)
  @UseGuards(GuestGuard)
  async signUp(
    @Ip() ipAddress: string,
    @Body() body: SignUpRequestBodyDto,
    @CurrentUser() user: Guest
  ): Promise<any> {
    try {
      this.logger.log("Started guest upgrade ", { ipAddress, body });
      const result = await this.authService.guestUpgrade(user, {
        email: body.email,
        name: body.name,
      });
      return result;
    } catch (error: unknown) {
      this.logger.error("Failed to signIn Guest", { error });
      throw new UnauthorizedException();
    }
  }
}
