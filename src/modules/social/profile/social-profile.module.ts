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
import { SocialProfileEventsSubscriber } from "./application/social-profile-events-subscriber";

@Module({
  imports: [
    BullModule.registerQueue({ name: SOCIAL_PROFILE_EVENTS_QUEUE_NAME }),
  ],
  providers: [
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
    // messages subscriber
    SocialProfileEventsSubscriber,
  ],
  exports: [BullModule],
})
export class SocialProfileModule {}
