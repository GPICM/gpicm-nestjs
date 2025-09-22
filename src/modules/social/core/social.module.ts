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
import {
  SOCIAL_PROFILE_EVENTS_QUEUE_NAME,
  SocialProfileEventsQueuePublisher,
} from "./domain/queues/social-profile-events-queue";
import { PubSubToBullSubscriber } from "./infra/queues/pub-sub-to-bull-subscriber";
import { BullQueuePublisher } from "@/modules/shared/infra/bull-queue-publisher";
import { getQueueToken } from "@nestjs/bullmq";
import { SocialProfileController } from "./presentation/profile.controller";
import { CreateProfileUseCase } from "./application/create-profile.usecase";

@Module({
  imports: [SocialQueueModule],
  controllers: [SocialController, SocialProfileController],
  providers: [
    ProfileService,
    AchievementService,
    CreateProfileUseCase,
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
    {
      provide: SocialProfileEventsQueuePublisher,
      useFactory: (queue) => {
        return new BullQueuePublisher(queue);
      },
      inject: [getQueueToken(SOCIAL_PROFILE_EVENTS_QUEUE_NAME)],
    },
    PubSubToBullSubscriber,
  ],
  exports: [
    ProfileService,
    ProfileRepository,
    CreateProfileUseCase,
    SocialProfileEventsQueuePublisher,
  ],
})
export class SocialCoreModule {}
