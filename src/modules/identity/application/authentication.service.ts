import {
  ConflictException,
  Inject,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { Encryptor } from "../domain/interfaces/jwt-encryptor";
import { UsersRepository } from "../domain/interfaces/repositories/users-repository";
import { User } from "../domain/entities/User";
import { UserRoles } from "../domain/enums/user-roles";
import { Guest } from "../domain/entities/Guest";
import { UserJWTpayload } from "../domain/object-values/user-jwt-payload";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { UserCredentialsRepository } from "../domain/interfaces/repositories/user-credentials-repository";
import { LogUserAction } from "@/modules/shared/application/log-user-action";
import { AuthProviders } from "../domain/enums/auth-provider";
import { ClientError } from "@/modules/shared/domain/protocols/client-error";
import { UserCredential } from "../domain/entities/UserCredential";
import { computeContentHash } from "@/modules/shared/utils/hash-utils";

export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name);

  constructor(
    @Inject(UsersRepository)
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
    ipAddress: string;
    userAgent: string;
  }): Promise<{ accessToken: string }> {
    try {
      this.logger.log("Started Sign Up", { params });
      const { name, email, password, deviceKey, ipAddress, userAgent } = params;

      let accessToken: string = "";

      let guestUser: Guest | null = null;
      if (deviceKey) {
        this.logger.log("DEvice key intercepted. searching for its guest");
        guestUser = (await this.usersRepository.findUserByDeviceKey(deviceKey, {
          roles: [UserRoles.GUEST],
        })) as Guest | null;
      }

      const emailExists = await this.usersRepository.findByCredentials(
        AuthProviders.EMAIL_PASSWORD,
        { email }
      );

      if (emailExists) {
        throw new ConflictException(
          new ClientError("EMAIL_ALREADY_IN_USE", "E-mail is already in use")
        );
      }

      let newUser: User | null = null;
      if (!guestUser) {
        this.logger.log("DEBUG: Creating a new user: -> ");
        try {
          const newCredential = UserCredential.CreateEmailPasswordCredential(
            null,
            email,
            password
          );

          this.logger.log("DEBUG: newCredential:", { newCredential });

          newUser = User.Create(name, newCredential);

          this.logger.log("DEBUG: [newUser'", { newUser });
          accessToken = this.encryptor.generateToken({
            sub: newUser.publicId,
          });

          this.logger.log("DEBUG: accesstoken:", { accessToken });
        } catch (error: unknown) {
          console.log(
            "DEBUG: Faled to create user",
            JSON.stringify(error, null, 4)
          );
        }
      } else {
        this.logger.log("Upgrading guest user");

        guestUser.upgrade(name, email, password);

        this.logger.log("DEBUG:  guest upgraded", { guestUser });

        accessToken = this.encryptor.generateToken({
          sub: guestUser.publicId,
        });

        this.logger.log("DEBUG: accesstoken:", { accessToken });
      }

      const latestTermsPolicy = await this.prismaService.policy.findFirst({
        where: {
          type: "TERMS_OF_SERVICE",
          deletedAt: null,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (!latestTermsPolicy) {
        throw new Error("Terms of Service policy not found");
      }

      const contentHash = computeContentHash(latestTermsPolicy.content);

      await this.prismaService.openTransaction(async (tx) => {
        if (newUser) {
          const userId = await this.usersRepository.add(newUser, tx);
          newUser.setId(userId);

          const newCredential = newUser.credentials[0];
          await this.userCredentialsRepository.add(newCredential, tx);

          await this.prismaService.userAgreement.create({
            data: {
              userId: userId,
              policyVersion: latestTermsPolicy.version,
              consentedAt: new Date(),
              contentHash,
              ipAddress,
              userAgent,
            },
          });
        } else if (guestUser) {
          const userId = guestUser.id!;
          const newCredential = guestUser.credentials[0];
          await this.userCredentialsRepository.add(newCredential, tx);
          await this.usersRepository.update(guestUser, tx);

          await this.prismaService.userAgreement.create({
            data: {
              userId: userId,
              policyVersion: latestTermsPolicy.version,
              consentedAt: new Date(),
              contentHash,
              ipAddress,
              userAgent,
            },
          });
        }
      });

      const userId = newUser?.id ?? guestUser?.id;

      await this.logUserAction.execute(userId!, "SIGNUP");

      return { accessToken };
    } catch (error: unknown) {
      this.logger.error("Failed to signin", { error });
      throw error;
    }
  }

  public async signIn(params: {
    email: string;
    password: string;
  }): Promise<{ accessToken: string }> {
    try {
      this.logger.log("Started user Sign In", { params });
      const { email, password } = params;

      const user = await this.usersRepository.findByCredentials(
        AuthProviders.EMAIL_PASSWORD,
        { email }
      );

      if (!user) {
        throw new UnauthorizedException("Invalid credentials");
      }

      const credential = user.getCredential(AuthProviders.EMAIL_PASSWORD);

      if (!credential || !credential.verifyPassword(password)) {
        throw new UnauthorizedException("Invalid credentials");
      }

      const accessToken = this.encryptor.generateToken({
        sub: user.publicId,
      });

      await this.logUserAction.execute(user.id!, "SIGNIN");

      return { accessToken };
    } catch (error: unknown) {
      this.logger.error("Failed to sign in", { error });
      throw new UnauthorizedException();
    }
  }
}
