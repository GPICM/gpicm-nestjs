import { Module } from "@nestjs/common";
import { AdminUsersController } from "./users/presentation/users.admin.controller";
import { UsersAdminRepository } from "./users/domain/interfaces/users-repository";
import { PrismaUserAdminRepository } from "./users/infra/repositories/prisma/prisma-users-repository.admin";
import { IdentityModule } from "../identity/identity.module";
import { SocialCoreModule } from "../social/core/social-core.module";
import { AlertsModule } from "./alerts/Alerts.module";
import { AdminAccessMetricsController } from "./metrics/presentation/access-metrics.admin.controller";
import { LoginMetricsService } from "./metrics/application/login-metrics.service";

@Module({
  imports: [IdentityModule, SocialCoreModule, AlertsModule],
  controllers: [AdminUsersController, AdminAccessMetricsController],
  providers: [
    LoginMetricsService,
    {
      provide: UsersAdminRepository,
      useClass: PrismaUserAdminRepository,
    },
  ],
  exports: [],
})
export class BackOfficeModule {}
