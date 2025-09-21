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
import { UserJWTpayload } from "../domain/value-objects/user-jwt-payload";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { UserCredentialsRepository } from "../domain/interfaces/repositories/user-credentials-repository";
import { LogUserAction } from "@/modules/shared/application/log-user-action";
import { AuthProviders } from "../domain/enums/auth-provider";
import { ClientError } from "@/modules/shared/domain/protocols/client-error";
import { UserCredential } from "../authentication/domain/entities/UserCredential";
import { UserVerificationService } from "../authentication/application/user/user-verification.service";
import { ProfileService } from "@/modules/social/core/application/profile.service";

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
    @Inject(ProfileService)
    private readonly profileService: ProfileService
  ) {}

  public async signUp(params: {
    name: string;
    email: string;
    password: string;
    deviceKey?: string;
  }): Promise<{ accessToken: string }> {
    try {
      this.logger.log("Started Sign Up", { params });

      const { name, email, password, deviceKey } = params;

      let guestUser: User | null = null;
      if (deviceKey) {
        this.logger.log("Device key intercepted. searching for its guest");
        guestUser = await this.usersRepository.findUserByDeviceKey(deviceKey, {
          roles: [UserRoles.GUEST],
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

      const emailPasswordCredential =
        UserCredential.CreateEmailPasswordCredential(email, password);

      let newUser: User | null = null;
      if (guestUser) {
        guestUser.setName(name);
        guestUser.setRole(UserRoles.USER);
        guestUser.addCredentials(emailPasswordCredential);
      } else {
        newUser = User.Create(name, emailPasswordCredential);
      }

      let userId: number;
      await this.prismaService.openTransaction(async (tx) => {
        if (newUser) {
          userId = await this.usersRepository.add(newUser, tx);
          newUser.setId(userId);

          emailPasswordCredential.setUserId(userId);

          await this.profileService.createProfile(newUser, {
            txContext: tx,
          });
        } else if (guestUser) {
          userId = guestUser.id;
          await this.usersRepository.update(guestUser, tx);

          await this.profileService.createProfile(guestUser, {
            txContext: tx,
          });
        }
        await this.userCredentialsRepository.add(emailPasswordCredential, tx);
      });

      await this.userVerificationService.startUserVerification(
        emailPasswordCredential
      );

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

      await this.logUserAction.execute(user.id, "SIGNIN");

      return { accessToken };
    } catch (error: unknown) {
      this.logger.error("Failed to sign in", { error });
      throw new UnauthorizedException();
    }
  }
}
