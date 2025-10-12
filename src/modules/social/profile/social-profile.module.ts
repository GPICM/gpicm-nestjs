import { Module } from "@nestjs/common";
import { BullModule, getQueueToken } from "@nestjs/bullmq";
import {
  SOCIAL_PROFILE_EVENTS_QUEUE_NAME,
  SocialProfileEventsQueuePublisher,
} from "./domain/queues/social-profile-events-queue";
import { BullSocialProfileProcessor } from "./application/bull-social-profile-queue-processor";
import { PrismaProfileRepository } from "../core/infra/repositories/prisma/prisma-profile-repository";
import { ProfileRepository } from "../core/domain/interfaces/repositories/profile-repository";
import { BullQueuePublisher } from "@/modules/shared/infra/bull-queue-publisher";
import { SocialProfileController } from "./presentation/profile.controller";
import { ProfileService } from "./application/profile.service";
import { SocialProfileAsyncController } from "./presentation/profile-async.controller";
import { SocialCoreModule } from "../core/social-core.module";
import { SocialFollowersController } from "./presentation/profile-followers.controller";

@Module({
  controllers: [
    SocialProfileController,
    SocialFollowersController,
    SocialProfileAsyncController,
  ],
  imports: [
    SocialCoreModule,
    BullModule.registerQueue({ name: SOCIAL_PROFILE_EVENTS_QUEUE_NAME }),
  ],
  providers: [
    ProfileService,
    BullSocialProfileProcessor,
    {
      provide: ProfileRepository,
      useClass: PrismaProfileRepository,
    },
    {
      provide: SocialProfileEventsQueuePublisher,
      useFactory: (queue) => new BullQueuePublisher(queue),
      inject: [getQueueToken(SOCIAL_PROFILE_EVENTS_QUEUE_NAME)],
    },
  ],
  exports: [],
})
export class SocialProfileModule {}
