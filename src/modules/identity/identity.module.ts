import { Global, Module } from "@nestjs/common";
import { GuestAuthController } from "./presentation/guest.auth.controller";
import { SharedModule } from "../shared/shared.module";
import { JwtAdapter } from "./infra/lib/jwt-Adapter";
import { GuestAuthenticationService } from "./application/guest/guest-authentication.service";
import { Encryptor } from "./domain/interfaces/jwt-encryptor";
import { AuthorizationService } from "./application/authorization.service";
import { PrismaUserRepository } from "./infra/repositories/prisma-users-repository";
import { UsersRepository } from "./domain/interfaces/repositories/users-repository";
import { DefaultJwtStrategy } from "./presentation/meta";
import { UserCredentialsRepository } from "./domain/interfaces/repositories/user-credentials-repository";
import { PrismaUserCredentialsRepository } from "./infra/repositories/prisma-user-credentials-repository";
import { CommonAuthController } from "./presentation/common.auth.controller";
import { AuthenticationService } from "./application/authentication.service";

@Global()
@Module({
  controllers: [GuestAuthController, CommonAuthController],
  providers: [
    AuthenticationService,
    GuestAuthenticationService,
    AuthorizationService,
    DefaultJwtStrategy,
    {
      provide: Encryptor,
      useFactory: () => new JwtAdapter(String(process.env.JWT_SECRET), "1d"),
    },
    { provide: UsersRepository, useClass: PrismaUserRepository },
    {
      provide: UserCredentialsRepository,
      useClass: PrismaUserCredentialsRepository,
    },
  ],
  imports: [SharedModule],
  exports: [Encryptor, DefaultJwtStrategy],
})
export class IdentityModule {}
