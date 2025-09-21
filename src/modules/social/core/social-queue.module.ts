import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import {
  SOCIAL_PROFILE_EVENTS_QUEUE_NAME,
  SocialProfileEventsQueuePublisher,
} from "./domain/queues/social-profile-events-queue";
import { BullSocialProfileConsumer } from "./infra/queues/bull-social-profile-events-queue-consumer";
import { ProfileFollowRepository } from "./domain/interfaces/repositories/profile-repository";
import { PrismaProfileFollowRepository } from "./infra/repositories/prisma/prisma-profile-follow-repository";
import { BullSocialProfileQueuePublisher } from "./infra/queues/bull-social-profile-events-queue-publisher";

@Module({
  imports: [
    BullModule.registerQueue({ name: SOCIAL_PROFILE_EVENTS_QUEUE_NAME }),
  ],
  providers: [
    BullSocialProfileConsumer,
    {
      provide: ProfileFollowRepository,
      useClass: PrismaProfileFollowRepository,
    },
    {
      provide: SocialProfileEventsQueuePublisher,
      useClass: BullSocialProfileQueuePublisher,
    },
  ],
  exports: [BullModule, SocialProfileEventsQueuePublisher],
})
export class SocialQueueModule {}
