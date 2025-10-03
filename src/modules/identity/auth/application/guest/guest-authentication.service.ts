import { Inject, Logger, UnauthorizedException } from "@nestjs/common";
import { LogUserAction } from "@/modules/shared/application/log-user-action";
import { HttpClient } from "@/modules/shared/domain/interfaces/http-client/http-client";
import { UsersRepository } from "@/modules/identity/core/domain/interfaces/repositories/users-repository";
import { Encryptor } from "@/modules/identity/core/domain/interfaces/jwt-encryptor";
import { UserJWTpayload } from "@/modules/identity/core/domain/value-objects/user-jwt-payload";
import { User } from "@/modules/identity/core/domain/entities/User";
import { UserStatus } from "@/modules/identity/core/domain/enums/user-status";

export class GuestAuthenticationService {
  private readonly logger = new Logger(GuestAuthenticationService.name);

  constructor(
    @Inject(HttpClient)
    private readonly httpClient: HttpClient,
    private readonly usersRepository: UsersRepository,
    private readonly logUserAction: LogUserAction,
    private readonly encryptor: Encryptor<UserJWTpayload>
  ) {}

  async signIn(
    params: GuestSignInParams,
    bypassCaptcha = false
  ): Promise<{ accessToken: string; deviceKey: string }> {
    try {
      const { name, captchaToken, deviceKey } = params;
      this.logger.log("Started guest Sign in");

      if (!bypassCaptcha) {
        const isValid = await this.validateReCaptcha({ captcha: captchaToken });

        if (!isValid) {
          throw new Error("Captcha failed to validate");
        }
      }

      let guestUser: User | null = null;
      if (deviceKey) {
        guestUser = await this.usersRepository.findUserByDeviceKey(deviceKey, {
          status: [UserStatus.GUEST],
        });
      }

      if (!guestUser) {
        guestUser = User.Create(name ?? `Visitante_${new Date().getTime()}`);
        const newUserId = await this.usersRepository.add(guestUser);
        guestUser.setId(newUserId);
      }

      const accessToken = this.encryptor.generateToken({
        sub: guestUser.publicId,
      });

      await this.logUserAction.execute(guestUser.id, "GUEST_SIGNIN");

      return { accessToken, deviceKey: guestUser.deviceKey };
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

      console.log(response);

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
  success: boolean;
  challenge_ts: string;
  hostname: string;
  score: number;
};

export interface GuestSignInParams {
  captchaToken: string;
  name?: string;
  deviceKey?: string;
  ipAddress?: string;
  deviceInfo?: Record<string, unknown>;
}
