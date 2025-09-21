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
import { PostMediasRepository } from "./domain/interfaces/repositories/post-media-repository";
import { PrismaPostMediasRepository } from "./infra/prisma-post-medias-repository";
import { PostMediaService } from "./application/post-media.service";
import { PrismaPostCommentRepository } from "./infra/prisma-post-comment-repository";
import { PostCommentRepository } from "./domain/interfaces/repositories/post-comment-repository";
import { CurseWordsFilterService } from "./application/curse-words-filter.service";
import { PostCommentsService } from "./application/post-comment.service";
import { CommentsQueue } from "./domain/interfaces/queues/comments-queue";
import { BullMqCommentsQueueAdapter } from "./infra/bull-mq-comments-queue-adapter";
import { PostCommentsProcessor } from "./application/ post-comments.processor";
import { IdentityModule } from "../identity/identity.module";
import { SocialModule } from "../social/core/social.module";

@Module({
  controllers: [PostController],
  imports: [
    SocialModule,
    BullModule.forRoot({
      connection: {
        url: String(process.env.REDIS_URL),
      },
    }),
    BullModule.registerQueue({
      name: "vote-events",
    }),
    BullModule.registerQueue({
      name: "comments-events",
    }),
    SharedModule,
    IncidentsModule,
    IdentityModule,
  ],
  providers: [
    PostCommentsProcessor,
    PostScoreProcessor,
    PostMediaService,
    { provide: VoteQueue, useClass: BullMqVoteQueueAdapter },
    { provide: CommentsQueue, useClass: BullMqCommentsQueueAdapter },
    {
      provide: PostRepository,
      useClass: PrismaPostRepository,
    },
    {
      provide: PostVotesRepository,
      useClass: PrismaPostVotesRepository,
    },
    {
      provide: PostCommentRepository,
      useClass: PrismaPostCommentRepository,
    },
    {
      provide: PostMediasRepository,
      useClass: PrismaPostMediasRepository,
    },
    PostServices,
    UploadService,
    IncidentsService,
    PostCommentsService,
    {
      provide: IncidentsRepository,
      useClass: PrismaIncidentsRepository,
    },
    RedisAdapter,
    CurseWordsFilterService,
  ],

  exports: [],
})
export class FeedModule {}