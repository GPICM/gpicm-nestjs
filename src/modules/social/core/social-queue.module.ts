import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { SOCIAL_PROFILE_EVENTS_QUEUE_NAME } from "./domain/queues/social-profile-events-queue";
import { BullSocialProfileConsumer } from "./infra/queues/bull-social-profile-events-queue-consumer";
import { PrismaProfileRepository } from "./infra/repositories/prisma/prisma-profile-repository";
import { ProfileRepository } from "./domain/interfaces/repositories/profile-repository";

@Module({
  imports: [
    BullModule.registerQueue({ name: SOCIAL_PROFILE_EVENTS_QUEUE_NAME }),
  ],
  providers: [
    BullSocialProfileConsumer,
    {
      provide: ProfileRepository,
      useClass: PrismaProfileRepository,
    },
  ],
  exports: [BullModule],
})
export class SocialQueueModule {}
