import {
  UnauthorizedException,
  Controller,
  UseGuards,
  Logger,
  Get,
  Post,
  Ip,
  Body,
  Inject,
  HttpException,
} from "@nestjs/common";

import { CurrentUser } from "./meta/decorators/user.decorator";
import { JwtAuthGuard } from "./meta";
import { User } from "../../core/domain/entities/User";
import {
  SignInRequestBodyDto,
  SignUpRequestBodyDto,
} from "./dtos/guest-auth-request.dtos";
import { AuthenticationService } from "../application/authentication.service";
import { IpAddress } from "@/modules/shared/decorators/IpAddress";

@Controller("identity")
export class CommonAuthController {
  private readonly logger = new Logger(CommonAuthController.name);

  public constructor(
    @Inject(AuthenticationService)
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
    @Body() body: SignUpRequestBodyDto,
    @IpAddress() ipAddress: string
  ): Promise<any> {
    try {
      this.logger.log("SignUp started ", { ipAddress, body });
      const result = await this.authenticationService.signUp({
        email: body.email,
        name: body.name,
        password: body.password,
        deviceKey: body.deviceKey,
      });

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
      const result = await this.authenticationService.signIn({
        email: body.email,
        password: body.password,
      });
      return result;
    } catch (error: unknown) {
      this.logger.error("Failed to signIn Guest", { error });
      throw new UnauthorizedException();
    }
  }
}
