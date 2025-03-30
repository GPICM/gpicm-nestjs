import { Inject, Logger, UnauthorizedException } from "@nestjs/common";
import { HttpClient } from "../../shared/domain/interfaces/http-client/http-client";
import { Encryptor } from "../domain/interfaces/jwt-encryptor";
import { UsersRepository } from "../domain/interfaces/repositories/users-repository";
import { User } from "../domain/entities/User";
import { UserRoles } from "../domain/enums/user-roles";
import { Guest } from "../domain/entities/Guest";
import { UserJWTpayload } from "../domain/object-values/user-jwt-payload";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { UserCredentialsRepository } from "../domain/interfaces/repositories/user-credentials-repository";
import { LogUserAction } from "@/modules/shared/application/log-user-action";

export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name);

  constructor(
    @Inject(HttpClient)
    private readonly httpClient: HttpClient,
    private readonly usersRepository: UsersRepository,
    private readonly userCredentialsRepository: UserCredentialsRepository,
    private readonly logUserAction: LogUserAction,
    private readonly encryptor: Encryptor<UserJWTpayload>,
    private readonly prismaService: PrismaService
  ) {}

  public async signUp(params: {
    name: string;
    email: string;
    password: string;
    deviceKey?: string;
  }): Promise<{ accessToken: string }> {
    try {
      this.logger.log("Started guest Sign Up", { params });
      const { name, email, password, deviceKey } = params;

      let accessToken: string = "";

      let guestUser: Guest | null = null;
      if (deviceKey) {
        guestUser = (await this.usersRepository.findUserByDeviceKey(deviceKey, {
          roles: [UserRoles.GUEST],
        })) as Guest | null;
      }

      let newUser: User | null = null;
      if (!guestUser) {
        newUser = User.CreateUser(name, email, password);

        accessToken = this.encryptor.generateToken({
          sub: newUser.publicId,
        });
      } else {
        guestUser.upgrade(name, email, password);

        accessToken = this.encryptor.generateToken({
          sub: guestUser.publicId,
        });
      }

      await this.prismaService.openTransaction(async (tx) => {
        if (newUser) {
          const userId = await this.usersRepository.add(newUser, tx);
          newUser.setId(userId);

          const newCredential = newUser.credentials[0];
          await this.userCredentialsRepository.add(newCredential, tx);
        } else if (guestUser) {
          await this.prismaService.openTransaction(async (tx) => {
            const newCredential = guestUser.credentials[0];
            await this.userCredentialsRepository.add(newCredential, tx);
            await this.usersRepository.update(guestUser, tx);
          });
        }
      });

      const userId = newUser?.id ?? guestUser?.id;

      await this.logUserAction.execute(userId!, "SIGNUP");

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
