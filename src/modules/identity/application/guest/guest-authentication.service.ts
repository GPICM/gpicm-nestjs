import { Inject, Logger, UnauthorizedException } from "@nestjs/common";
import { HttpClient } from "../../../shared/domain/interfaces/http-client/http-client";
import { Encryptor } from "../../domain/interfaces/jwt-encryptor";
import { UsersRepository } from "../../domain/interfaces/repositories/users-repository";
import { User } from "../../domain/entities/User";
import { UserRoles } from "../../domain/enums/user-roles";
import { Guest } from "../../domain/entities/Guest";
import { UserJWTpayload } from "../../domain/object-values/user-jwt-payload";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { UserCredentialsRepository } from "../../domain/interfaces/repositories/user-credentials-repository";
import { randomUUID } from "crypto";

export class GuestAuthenticationService {
  private readonly logger = new Logger(GuestAuthenticationService.name);

  constructor(
    @Inject(HttpClient)
    private readonly httpClient: HttpClient,
    private readonly usersRepository: UsersRepository,
    private readonly userCredentialsRepository: UserCredentialsRepository,
    private readonly encryptor: Encryptor<UserJWTpayload>,
    private readonly prismaService: PrismaService
  ) {}

  async signIn(
    params: GuestSignInParams,
    bypassCaptcha = false
  ): Promise<{ accessToken: string; deviceKey: string }> {
    try {
      const { name, captchaToken, deviceKey, ipAddress, deviceInfo } = params;
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
          roles: [UserRoles.GUEST],
        });
      }

      if (!guestUser) {
        guestUser = User.CreateGuest(name, ipAddress, deviceInfo);
        await this.usersRepository.add(guestUser);
      }

      const accessToken = this.encryptor.generateToken({
        sub: guestUser.publicId,
      });

      return { accessToken, deviceKey: guestUser.deviceKey };
    } catch (error: unknown) {
      this.logger.error("Failed to signin", { error });
      throw new UnauthorizedException();
    }
  }

  public async guestUpgrade(
    guestUser: Guest,
    params: {
      name: string;
      email: string;
      password: string;
    }
  ): Promise<{ accessToken: string }> {
    try {
      this.logger.log("Started guest Sign Up", { guestUser, params });
      const { name, email, password } = params;

      if (guestUser.role !== UserRoles.GUEST) {
        throw new Error("Users is no longe guest");
      }

      const newCredential = guestUser.upgrade(name, email, password);

      await this.prismaService.openTransaction(async (tx) => {
        await this.userCredentialsRepository.add(newCredential, tx);
        await this.usersRepository.update(guestUser, tx);
      });

      const accessToken = this.encryptor.generateToken({
        sub: guestUser.publicId,
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
  name?: string;
  deviceKey?: string;
  ipAddress?: string;
  deviceInfo?: Record<string, unknown>;
}
