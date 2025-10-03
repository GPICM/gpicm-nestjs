import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  Ip,
  Logger,
} from "@nestjs/common";
import { GuestSignInRequestBodyDto } from "./dtos/guest-auth-request.dtos";
import { GuestAuthenticationService } from "../application/guest/guest-authentication.service";

@Controller("identity/guest/auth")
export class GuestAuthController {
  private readonly logger = new Logger(GuestAuthController.name);

  constructor(private readonly authService: GuestAuthenticationService) {}

  @Post("/signin")
  async signIn(
    @Ip() ipAddress: string,
    @Body() body: GuestSignInRequestBodyDto
  ) {
    try {
      this.logger.log("Started guest signin ", { ipAddress, body });
      const result = await this.authService.signIn(
        {
          name: body.name,
          deviceKey: body.deviceKey,
          captchaToken: body.captchaToken,
          ipAddress: ipAddress,
        },
        true // process.env.NODE_ENV !== "production"
      );
      return result;
    } catch (error: unknown) {
      this.logger.error("Failed to signIn Guest", { error });
      throw new UnauthorizedException();
    }
  }
}
