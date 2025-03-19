import { Inject, Logger, UnauthorizedException } from "@nestjs/common";
import { HttpClient } from "../../../shared/domain/interfaces/http-client/http-client";
import { Encryptor } from "../../domain/interfaces/jwt-encryptor";
import { UsersRepository } from "../../domain/interfaces/repositories/users-repository";
import { User } from "../../domain/entities/User";
import { UserRoles } from "../../domain/enums/user-roles";
import { Guest } from "../../domain/entities/Guest";
import { TYPES } from "../../types";

export class GuestAuthenticationService {
  private readonly logger = new Logger(GuestAuthenticationService.name);

  constructor(
    @Inject(HttpClient)
    private readonly httpClient: HttpClient,
    private readonly usersRepository: UsersRepository,
    @Inject(TYPES.AccessTokenEncryptor)
    private readonly encryptor: Encryptor<any>
  ) {}

  async signIn(params: GuestSignInParams): Promise<{ accessToken: string }> {
    try {
      const { captchaToken, deviceKey, ipAddress, deviceInfo } = params;
      this.logger.log("Started guest Sign in");

      const isValid = await this.validateReCaptcha({ captcha: captchaToken });

      if (!isValid) {
        throw new Error("Captcha failed to validate");
      }

      let guestUser = await this.usersRepository.findUserByDeviceKey(
        deviceKey,
        { roles: [UserRoles.GUEST] }
      );

      if (!guestUser) {
        guestUser = User.CreateGuest(deviceKey, ipAddress, deviceInfo);
        await this.usersRepository.add(guestUser);
      }

      const accessToken = this.encryptor.generateToken({
        sub: guestUser.uuid,
        role: guestUser.role,
      });

      return { accessToken };
    } catch (error: unknown) {
      this.logger.error("Failed to signin", { error });
      throw new UnauthorizedException();
    }
  }

  public async guestUpgrade(
    guestUser: Guest,
    params: GuestUpgradeParams
  ): Promise<{ accessToken: string }> {
    try {
      const { name, email } = params;
      this.logger.log("Started guest Sign Up");

      if (guestUser.role !== UserRoles.GUEST) {
        throw new Error("Users is no longe guest");
      }

      guestUser.upgrade(email, name);
      await this.usersRepository.update(guestUser);

      const accessToken = this.encryptor.generateToken({
        sub: guestUser.uuid,
        role: guestUser.role,
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
  deviceKey: string;
  ipAddress?: string;
  deviceInfo?: Record<string, unknown>;
}

export interface GuestUpgradeParams {
  name: string;
  email: string;
}
