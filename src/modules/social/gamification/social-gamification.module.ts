import { Module } from "@nestjs/common";

import { SocialCoreModule } from "../core/social-core.module";
import { AchievementService } from "./application/achievement.service";
import { CreateAchievementUseCase } from "./application/create-achievement-usecase";
import { SocialGamificationAdminController } from "./presentation/social-gamification.admin.controller";
import { AchievementsRepository } from "./domain/interfaces/repositories/achievements-repository";
import { PrismaAchievementRepository } from "./infra/repositores/prisma-achievement-repository";

@Module({
  controllers: [SocialGamificationAdminController],
  imports: [SocialCoreModule],
  providers: [
    AchievementService,
    CreateAchievementUseCase,
    { provide: AchievementsRepository, useClass: PrismaAchievementRepository },
  ],
  exports: [],
})
export class SocialGamificationModule {}
