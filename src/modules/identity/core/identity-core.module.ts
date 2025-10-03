import { Module } from "@nestjs/common";

import { JwtAdapter } from "./infra/lib/jwt-Adapter";
import { Encryptor } from "./domain/interfaces/jwt-encryptor";
import { UsersRepository } from "./domain/interfaces/repositories/users-repository";
import { PrismaUserRepository } from "./infra/repositories/prisma-users-repository";

@Module({
  controllers: [],
  providers: [
    {
      provide: Encryptor,
      useFactory: () => new JwtAdapter(String(process.env.JWT_SECRET), "1d"),
    },
    { provide: UsersRepository, useClass: PrismaUserRepository },
  ],
  imports: [],
  exports: [Encryptor, UsersRepository],
})
export class IdentityCoreModule {}
