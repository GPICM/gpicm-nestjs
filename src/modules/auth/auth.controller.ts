import { Body, Controller, Get, Post } from "@nestjs/common";
import { LoginRequestBodyDto } from "./dtos/login-request.dtos";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/login")
  async login(@Body() body: LoginRequestBodyDto): Promise<any> {
    console.log(body);

    const response = await this.authService.validateReCaptcha({
      captcha: body.token,
    });

    console.log(response);

    return "ok";
  }
}
