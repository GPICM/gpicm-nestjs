import { Global, Module } from "@nestjs/common";
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
import { BullModule } from "@nestjs/bullmq";
import {
  SOCIAL_PROFILE_EVENTS_QUEUE_NAME,
  SocialProfileEventsQueuePublisher,
} from "./domain/queues/social-profile-events-queue";
import { BullSocialProfileQueuePublisher } from "./infra/queues/bull-social-profile-events-queue-publisher";

@Global()
@Module({
  controllers: [SocialController],
  providers: [
    ProfileService,
    AchievementService,
    {
      provide: SocialProfileEventsQueuePublisher,
      useClass: BullSocialProfileQueuePublisher,
    },
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
  imports: [
    BullModule.registerQueue({ name: SOCIAL_PROFILE_EVENTS_QUEUE_NAME }),
  ],
  exports: [ProfileService],
})
export class SocialModule {}
