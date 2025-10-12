import {
  ConflictException,
  Inject,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { Encryptor } from "../../core/domain/interfaces/jwt-encryptor";
import { UsersRepository } from "../../core/domain/interfaces/repositories/users-repository";
import { User } from "../../core/domain/entities/User";
import { UserRoles } from "../../core/domain/enums/user-roles";
import { UserJWTpayload } from "../../core/domain/value-objects/user-jwt-payload";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { LogUserAction } from "@/modules/shared/application/log-user-action";
import { AuthProviders } from "../../core/domain/enums/auth-provider";
import { ClientError } from "@/modules/shared/domain/protocols/client-error";
import { UserCredential } from "../domain/entities/UserCredential";
import { UserVerificationService } from "./user/user-verification.service";
import { UserStatus } from "../../core/domain/enums/user-status";
import { UserCredentialsRepository } from "../domain/interfaces/repositories/user-credentials-repository";
import { CreateProfileUseCase } from "@/modules/social/core/application/create-profile.usecase";

export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name);

  constructor(
    @Inject(UsersRepository)
    private readonly usersRepository: UsersRepository,
    private readonly userCredentialsRepository: UserCredentialsRepository,
    private readonly logUserAction: LogUserAction,
    private readonly encryptor: Encryptor<UserJWTpayload>,
    private readonly prismaService: PrismaService,
    private readonly userVerificationService: UserVerificationService,
    private readonly createProfile: CreateProfileUseCase
  ) {}

  public async signUp(
    params: {
      name: string;
      email: string;
      password: string;
      deviceKey?: string;
    },
    device?: { ipAddress?: string }
  ): Promise<{ accessToken: string }> {
    try {
      this.logger.log("Started Sign Up", { params });

      const { name, email, password, deviceKey } = params;

      let guestUser: User | null = null;
      if (deviceKey) {
        this.logger.log("Device key intercepted. searching for its guest");
        guestUser = await this.usersRepository.findUserByDeviceKey(deviceKey, {
          status: [UserStatus.GUEST],
        });

        this.logger.log("Device key search result", { guestUser });
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

      const credentials = UserCredential.CreateEmailPasswordCredential(
        email,
        password
      );

      let newUser: User | null = null;
      if (guestUser) {
        guestUser.setName(name);
        guestUser.setRole(UserRoles.USER);
        guestUser.setStatus(UserStatus.PENDING);
        guestUser.addCredentials(credentials);

        guestUser.lastLoginAt = new Date();
        guestUser.ipAddress = device?.ipAddress || null;
      } else {
        newUser = User.Create(name, credentials);
        newUser.setStatus(UserStatus.PENDING);

        newUser.lastLoginAt = new Date();
        newUser.ipAddress = device?.ipAddress || null;
      }

      let userId: number;
      await this.prismaService.openTransaction(async (tx) => {
        if (newUser) {
          userId = await this.usersRepository.add(newUser, tx);
          newUser.setId(userId);
          credentials.setUserId(userId);

          await this.createProfile.execute(newUser, { txContext: tx });
        } else if (guestUser) {
          userId = guestUser.id;

          await this.usersRepository.update(guestUser, tx);
          await this.createProfile.execute(guestUser, { txContext: tx });
        }

        await this.userCredentialsRepository.add(credentials, tx);
      });

      await this.userVerificationService.startUserVerification(credentials);

      await this.logUserAction.execute(userId!, "SIGNUP");
      const accessToken = this.encryptor.generateToken({
        sub: (guestUser?.publicId || newUser?.publicId)!,
      });

      return { accessToken };
    } catch (error: unknown) {
      this.logger.error("Failed to signin", { error });
      throw error;
    }
  }

  public async signIn(
    params: {
      email: string;
      password: string;
    },
    device?: { ipAddress?: string }
  ): Promise<{ accessToken: string }> {
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

      this.logger.log(`User: ${user?.id}`);

      const credential = user.getCredential(AuthProviders.EMAIL_PASSWORD);
      if (!credential || !credential.verifyPassword(password)) {
        throw new UnauthorizedException("Invalid credentials");
      }

      if ([UserStatus.BANNED, UserStatus.SUSPENDED].includes(user.status)) {
        throw new UnauthorizedException("User is banned or suspended");
      }

      user.lastLoginAt = new Date();
      user.ipAddress = device?.ipAddress || null;
      await this.usersRepository.update(user);

      const accessToken = this.encryptor.generateToken({
        sub: user.publicId,
      });

      await this.logUserAction.execute(user.id, "SIGNIN");

      return { accessToken };
    } catch (error: unknown) {
      this.logger.error("Failed to sign in", { error });
      throw new UnauthorizedException();
    }
  }
}
