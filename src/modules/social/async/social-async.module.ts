import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { SOCIAL_PROFILE_EVENTS_QUEUE_NAME } from "../core/domain/queues/social-profile-events-queue";
import { BullSocialProfileProcessor } from "./application/bull-social-profile-queue-processor";
import { PrismaProfileRepository } from "../core/infra/repositories/prisma/prisma-profile-repository";
import { ProfileRepository } from "../core/domain/interfaces/repositories/profile-repository";

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
  ],
  exports: [BullModule],
})
export class SocialQueueModule {}
