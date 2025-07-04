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
import { PartnerApiKeysRepository } from "./domain/interfaces/repositories/partner-api-keys-repository";
import { PrismaPartnerApiKeysRepository } from "./infra/repositories/prisma-partner-api-key-repository";
import { PartnerApiKeyGuard } from "./presentation/meta/guards/partner-api-key.guard";
import { UserController } from "./presentation/user.controller";
import { UserService } from "./application/user.service";
import { PoliciesModule } from "./policies/policies.module";

@Global()
@Module({
  controllers: [GuestAuthController, CommonAuthController, UserController],
  providers: [
    AuthenticationService,
    GuestAuthenticationService,
    UserService,
    AuthorizationService,
    DefaultJwtStrategy,
    PartnerApiKeyGuard,
    {
      provide: Encryptor,
      useFactory: () => new JwtAdapter(String(process.env.JWT_SECRET), "1d"),
    },
    { provide: UsersRepository, useClass: PrismaUserRepository },
    {
      provide: PartnerApiKeysRepository,
      useClass: PrismaPartnerApiKeysRepository,
    },
    {
      provide: UserCredentialsRepository,
      useClass: PrismaUserCredentialsRepository,
    },
  ],
  imports: [SharedModule, PoliciesModule],
  exports: [
    Encryptor,
    DefaultJwtStrategy,
    PartnerApiKeysRepository,
    PartnerApiKeyGuard,
  ],
})
export class IdentityModule {}
