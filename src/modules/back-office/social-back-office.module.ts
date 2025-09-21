import { Module } from "@nestjs/common";
import { AdminUsersController } from "./users/presentation/users.admin.controller";
import { UsersRepository } from "./users/domain/interfaces/users-repository";
import { PrismaUserRepository } from "../identity/infra/repositories/prisma-users-repository";

@Module({
  imports: [],
  controllers: [AdminUsersController],
  providers: [
    {
      provide: UsersRepository,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [],
})
export class BackOfficeModule {}
