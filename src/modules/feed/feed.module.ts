import { Module } from "@nestjs/common";
import { SharedModule } from "../shared/shared.module";
import { PrismaPostRepository } from "./infra/prisma-post-repository";
import { PrismaPostVotesRepository } from "./infra/prisma-post-votes-repository";
import { PostController } from "./presentation/post.controller";
import { PostRepository } from "./domain/interfaces/repositories/post-repository";
import { PostServices } from "./application/post.service";
import { PostVotesRepository } from "./domain/interfaces/repositories/post-votes-repository";
import { UploadService } from "../assets/application/upload.service";
import { IncidentsService } from "../incidents/application/incidents.service";
import { IncidentsRepository } from "../incidents/domain/interfaces/repositories/incidents-repository";
import { PrismaIncidentsRepository } from "../incidents/infra/prisma-incidents-repository";
import { IncidentsModule } from "../incidents/incidents.module";
import { RedisAdapter } from "../shared/infra/lib/redis/redis-adapter";
import { BullModule } from "@nestjs/bullmq";
import { PostScoreProcessor } from "./application/ post-score.processor";
import { BullMqVoteQueueAdapter } from "./infra/bull-mq-vote-queue-adapter";
import { VoteQueue } from "./domain/interfaces/queues/vote-queue";

@Module({
  controllers: [PostController],
  imports: [
    BullModule.forRoot({
      connection: {
        host: "redis",
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: "vote-events",
    }),
    SharedModule,
    IncidentsModule,
  ],
  providers: [
    PostScoreProcessor,
    { provide: VoteQueue, useClass: BullMqVoteQueueAdapter },
    {
      provide: PostRepository,
      useClass: PrismaPostRepository,
    },
    {
      provide: PostVotesRepository,
      useClass: PrismaPostVotesRepository,
    },
    PostServices,
    UploadService,
    IncidentsService,
    {
      provide: IncidentsRepository,
      useClass: PrismaIncidentsRepository,
    },
    RedisAdapter,
  ],

  exports: [],
})
export class FeedModule {}
