import { Module } from "@nestjs/common";
import { AdminUsersController } from "./users/presentation/users.admin.controller";
import { UsersAdminRepository } from "./users/domain/interfaces/users-repository";
import { PrismaUserAdminRepository } from "./users/infra/repositories/prisma/prisma-users-repository.admin";

@Module({
  imports: [],
  controllers: [AdminUsersController],
  providers: [
    {
      provide: UsersAdminRepository,
      useClass: PrismaUserAdminRepository,
    },
  ],
  exports: [],
})
export class BackOfficeModule {}
