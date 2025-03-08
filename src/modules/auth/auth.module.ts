import { Global, Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { SharedModule } from "../shared/shared.module";
import { Encryptor } from "./domain/interfaces/jwt-encryptor";
import { JwtAdapter } from "./infra/lib/jwt-Adapter";
import { DefaultJwtStrategy } from "./strategies/default-jwt.strategy";
import { AuthorizationService } from "./authorization.service";

@Global()
@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthorizationService,
    DefaultJwtStrategy,
    {
      provide: Encryptor,
      useValue: new JwtAdapter(String(process.env.JWT_SECRET), "1d"),
    },
  ],
  imports: [SharedModule],
  exports: [DefaultJwtStrategy],
})
export class AuthModule {}
