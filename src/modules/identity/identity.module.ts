import { Global, Module } from "@nestjs/common";
import { AuthController } from "./presentation/guest.auth.controller";
import { SharedModule } from "../shared/shared.module";
import { JwtAdapter } from "./infra/lib/jwt-Adapter";
import { DefaultJwtStrategy } from "./presentation/strategies/default-jwt.strategy";
import { GuestAuthenticationService } from "./application/guest/guest-authentication.service";
import { TYPES } from "./types";
import { Encryptor } from "./domain/interfaces/jwt-encryptor";
import { AuthorizationService } from "./application/authorization.service";
import { PrismaUserRepository } from "./infra/repositories/prisma-users-repository";
import { UsersRepository } from "./domain/interfaces/repositories/users-repository";

@Global()
@Module({
  controllers: [AuthController],
  providers: [
    GuestAuthenticationService,
    AuthorizationService,
    DefaultJwtStrategy,
    {
      provide: TYPES.AccessTokenEncryptor,
      inject: [Encryptor<any>],
      useFactory: () => {
        return new JwtAdapter(String(process.env.JWT_SECRET), "1d");
      },
    },
    { provide: UsersRepository, useClass: PrismaUserRepository },
  ],
  imports: [SharedModule],
  exports: [DefaultJwtStrategy],
})
export class IdentityModule {}
