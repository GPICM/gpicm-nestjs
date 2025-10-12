import { Module } from "@nestjs/common";
import { PrismaProfileRepository } from "@/modules/social/core/infra/repositories/prisma/prisma-profile-repository";
import {
  ProfileFollowRepository,
  ProfileRepository,
} from "@/modules/social/core/domain/interfaces/repositories/profile-repository";
import { AchievementsRepository } from "@/modules/social/gamification/domain/interfaces/repositories/achievements-repository";
import { PrismaAchievementRepository } from "@/modules/social/gamification/infra/repositores/prisma-achievement-repository";
import { AchievementService } from "../gamification/application/achievement.service";
import { PrismaProfileFollowRepository } from "./infra/repositories/prisma/prisma-profile-follow-repository";
import { CreateProfileUseCase } from "./application/create-profile.usecase";
import { FindProfileByUserUseCase } from "./application/find-profile-by-user.usecase";

@Module({
  imports: [],
  controllers: [],
  providers: [
    AchievementService,
    CreateProfileUseCase,
    FindProfileByUserUseCase,
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
  exports: [
    ProfileRepository,
    ProfileFollowRepository,
    CreateProfileUseCase,
    FindProfileByUserUseCase,
  ],
})
export class SocialCoreModule {}
