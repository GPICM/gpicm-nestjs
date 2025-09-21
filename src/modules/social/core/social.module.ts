import { Module } from "@nestjs/common";
import { PrismaProfileRepository } from "@/modules/social/core/infra/repositories/prisma/prisma-profile-repository";
import { ProfileService } from "@/modules/social/core/application/profile.service";
import {
  ProfileFollowRepository,
  ProfileRepository,
} from "@/modules/social/core/domain/interfaces/repositories/profile-repository";
import { AchievementsRepository } from "@/modules/social/core/domain/interfaces/repositories/achievements-repository";
import { PrismaAchievementRepository } from "@/modules/social/core/infra/repositories/prisma/prisma-achievement-repository";
import { AchievementService } from "./application/achievement.service";
import { SocialController } from "./presentation/social.controller";
import { PrismaProfileFollowRepository } from "./infra/repositories/prisma/prisma-profile-follow-repository";
import { SocialQueueModule } from "./social-queue.module";

@Module({
  imports: [SocialQueueModule],
  controllers: [SocialController],
  providers: [
    ProfileService,
    AchievementService,
    {
      provide: ProfileRepository,
      useClass: PrismaProfileRepository,
    },
    {
      provide: AchievementsRepository,
      useClass: PrismaAchievementRepository,
    },
    {
      provide: ProfileFollowRepository,
      useClass: PrismaProfileFollowRepository,
    },
  ],
  exports: [ProfileService],
})
export class SocialCoreModule {}
