import { Global, Module } from "@nestjs/common";
import { UserController } from "./presentation/user.controller";
import { GuestAuthController } from "./presentation/guest.auth.controller";
import { CommonAuthController } from "./presentation/common.auth.controller";
import { UserVerificationController } from "./presentation/user-verification.controller";
import { UserVerificationService } from "./application/user/user-verification.service";
import { AuthenticationService } from "./application/authentication.service";
import { GuestAuthenticationService } from "./application/guest/guest-authentication.service";
import { UserService } from "./application/user/user.service";
import { AuthorizationService } from "./application/authorization.service";
import { DefaultJwtStrategy } from "./presentation/meta";
import { PartnerApiKeyGuard } from "./presentation/meta/guards/partner-api-key.guard";
import { Encryptor } from "../core/domain/interfaces/jwt-encryptor";
import { JwtAdapter } from "../core/infra/lib/jwt-Adapter";
import { PartnerApiKeysRepository } from "./domain/interfaces/repositories/partner-api-keys-repository";
import { PrismaPartnerApiKeysRepository } from "./infra/prisma-partner-api-key-repository";
import { UserCredentialsRepository } from "./domain/interfaces/repositories/user-credentials-repository";
import { PrismaUserCredentialsRepository } from "./infra/prisma-user-credentials-repository";
import { UserVerificationRepository } from "./domain/interfaces/repositories/user-verification-repository";
import { PrismaUserVerificationRepository } from "./infra/prisma-user-verification-repository";
import { IdentityCoreModule } from "../core/identity-core.module";
import { ExternalProfileModule } from "@/modules/social/core/external-profile.module";

@Global()
@Module({
  imports: [IdentityCoreModule, ExternalProfileModule],
  controllers: [
    UserController,
    GuestAuthController,
    CommonAuthController,
    UserVerificationController,
  ],
  providers: [
    UserVerificationService,
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
    {
      provide: PartnerApiKeysRepository,
      useClass: PrismaPartnerApiKeysRepository,
    },
    {
      provide: UserCredentialsRepository,
      useClass: PrismaUserCredentialsRepository,
    },
    {
      provide: UserVerificationRepository,
      useClass: PrismaUserVerificationRepository,
    },
  ],
  exports: [
    Encryptor,
    DefaultJwtStrategy,
    PartnerApiKeysRepository,
    PartnerApiKeyGuard,
    UserService,
  ],
})
export class IdentityAuthModule {}
