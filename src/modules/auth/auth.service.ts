import { Inject, Logger } from "@nestjs/common";
import { HttpClient } from "../shared/domain/interfaces/http-client/http-client";

export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(HttpClient)
    private readonly httpClient: HttpClient
  ) {}

  public async validateReCaptcha({
    captcha,
  }: {
    captcha: string;
  }): Promise<boolean> {
    try {
      const url = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RE_CAPTCHA_SECRET_KEY}&response=${captcha}`;
      const response = await this.httpClient.request({
        url,
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
