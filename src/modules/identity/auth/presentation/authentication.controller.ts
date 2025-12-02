import {
  UnauthorizedException,
  Controller,
  Logger,
  Post,
  Ip,
  Body,
  Inject,
  HttpException,
} from "@nestjs/common";

import {
  SignInRequestBodyDto,
  SignUpRequestBodyDto,
} from "./dtos/guest-auth-request.dtos";
import { AuthenticationService } from "../application/authentication.service";
import { IpAddress } from "@/modules/shared/decorators/IpAddress";

@Controller("identity")
export class AuthenticationController {
  private readonly logger = new Logger(AuthenticationController.name);

  public constructor(
    @Inject(AuthenticationService)
    private readonly authenticationService: AuthenticationService
  ) {}

  @Post("/signup")
  async signUp(
    @Body() body: SignUpRequestBodyDto,
    @IpAddress() ipAddress: string
  ): Promise<any> {
    try {
      this.logger.log("SignUp started ", { ipAddress, body });
      const result = await this.authenticationService.signUp(
        {
          email: body.email,
          name: body.name,
          bio: body.bio,
          password: body.password,
          deviceKey: body.deviceKey,
        },
        {
          ipAddress,
        }
      );

      return result;
    } catch (error: unknown) {
      this.logger.error("Failed to sign up guest", { error });
      if (error instanceof HttpException && error?.getStatus() === 409) {
        throw error;
      }

      throw new UnauthorizedException();
    }
  }

  @Post("/signin")
  async signin(
    @Ip() ipAddress: string,
    @Body() body: SignInRequestBodyDto
  ): Promise<any> {
    try {
      this.logger.log("Started guest upgrade ", { ipAddress, body });
      const result = await this.authenticationService.signIn(
        {
          email: body.email,
          password: body.password,
        },
        {
          ipAddress,
        }
      );
      return result;
    } catch (error: unknown) {
      this.logger.error("Failed to signIn Guest", { error });
      throw new UnauthorizedException();
    }
  }
}
