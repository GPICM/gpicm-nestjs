import { Body, Controller, Post, UnauthorizedException } from "@nestjs/common";
import { LoginRequestBodyDto } from "./dtos/login-request.dtos";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/login")
  async login(@Body() body: LoginRequestBodyDto): Promise<any> {
    try {
      const result = await this.authService.execute(body.token);
      return result;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: unknown) {
      throw new UnauthorizedException();
    }
  }
}
