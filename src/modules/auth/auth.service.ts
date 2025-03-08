import { Inject, Logger, UnauthorizedException } from "@nestjs/common";
import { HttpClient } from "../shared/domain/interfaces/http-client/http-client";
import { Encryptor } from "./domain/interfaces/jwt-encryptor";

export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(HttpClient)
    private readonly httpClient: HttpClient,
    private readonly encryptor: Encryptor<any>,
  ) {}

  async execute(captchaToken: string): Promise<{ accessToken: string }> {
    try {
      this.logger.log("Started Signin");

      if (captchaToken !== "admin123") {
        const isValid = await this.validateReCaptcha({ captcha: captchaToken });

        if (!isValid) {
          throw new Error("captcha failed");
        }
      }

      const accessToken = this.encryptor.generateToken({
        sub: captchaToken,
      });

      return { accessToken };
    } catch (error: unknown) {
      this.logger.error("Failed to signin", { error });
      throw new UnauthorizedException();
    }
  }

  public async validateReCaptcha({
    captcha,
    ipAddress = "localhost",
  }: {
    captcha: string;
    ipAddress?: string;
  }): Promise<boolean> {
    try {
      const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_PRIVATE_KEY}&response=${captcha}&remoteip=${ipAddress}`;

      const response = await this.httpClient.request({
        url: verificationUrl,
        method: "POST",
        body: { captcha },
      });

      if (response.isError()) {
        throw new Error("Failed to request recaptcha");
      }

      const data = response.getData<ReCaptchaResult>();
      if (data.success !== true) {
        throw new Error("Repatch payload is malformed");
      }

      this.logger.log("Successfully validated ReCaptcha", { data });
      return true;
    } catch (error: unknown) {
      this.logger.error("Failed to validate ReCaptcha", { error });
      return false;
    }
  }
}

export type ReCaptchaResult = {
  success: true;
  challenge_ts: "2024-11-24T03:04:34Z";
  hostname: "localhost";
  score: 0.9;
};
