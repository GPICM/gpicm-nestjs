import { Module } from "@nestjs/common";

import { SocialCoreModule } from "../core/social-core.module";
import { AchievementService } from "./application/achievement.service";
import { CreateAchievementUseCase } from "./application/create-achievement-usecase";
import { SocialGamificationAdminController } from "./presentation/social-gamification.admin.controller";
import { AchievementsRepository } from "./domain/interfaces/repositories/achievements-repository";
import { PrismaAchievementRepository } from "./infra/repositores/prisma-achievement-repository";
import { ProfileAchievementRepository } from "./domain/interfaces/repositories/profile-achievements-repository";
import { PrismaProfileAchievementRepository } from "./infra/repositores/prisma-profile-achievement-repository";
import { AchievementEngine } from "./application/achievement.engine";
import { SocialGamificationAsyncController } from "./presentation/social-gamification-async.controller";

@Module({
  controllers: [
    SocialGamificationAdminController,
    SocialGamificationAsyncController,
  ],
  imports: [SocialCoreModule],
  providers: [
    AchievementService,
    CreateAchievementUseCase,
    AchievementEngine,
    {
      provide: ProfileAchievementRepository,
      useClass: PrismaProfileAchievementRepository,
    },
    { provide: AchievementsRepository, useClass: PrismaAchievementRepository },
  ],
  exports: [],
})
export class SocialGamificationModule {}
