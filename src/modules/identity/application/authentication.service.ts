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
import { EmailPasswordCredential } from "../domain/entities/UserCredential";
import { AuthProviders } from "../domain/enums/auth-provider";
import { ClientError } from "@/modules/shared/domain/protocols/client-error";

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
  }): Promise<{ accessToken: string }> {
    try {
      this.logger.log("Started Sign Up", { params });
      const { name, email, password, deviceKey } = params;

      let accessToken: string = "";

      let guestUser: Guest | null = null;
      if (deviceKey) {
        this.logger.log("DEvice key intercepted. searching for its guest");
        guestUser = (await this.usersRepository.findUserByDeviceKey(deviceKey, {
          roles: [UserRoles.GUEST],
        })) as Guest | null;

        this.logger.log("guest result: ", guestUser);
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
        this.logger.log("Creating a new user");
        newUser = User.Create(name, email, password);

        accessToken = this.encryptor.generateToken({
          sub: newUser.publicId,
        });
      } else {
        this.logger.log("Upgrading guest user");

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

      const credential = user.getCredential(
        AuthProviders.EMAIL_PASSWORD
      ) as EmailPasswordCredential | null;

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
