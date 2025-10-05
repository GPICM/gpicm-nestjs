import { Module } from "@nestjs/common";
import { PrismaPostRepository } from "./infra/prisma-post-repository";
import { PrismaPostVotesRepository } from "./infra/prisma-post-votes-repository";
import { PostController } from "./presentation/post.controller";
import { PostRepository } from "./domain/interfaces/repositories/post-repository";
import { PostServices } from "./application/post.service";
import { PostVotesRepository } from "./domain/interfaces/repositories/post-votes-repository";
import { BullModule, getQueueToken } from "@nestjs/bullmq";
import { PostScoreProcessor } from "./application/bull-social-post-queue-processor";
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
import { SharedModule } from "@/modules/shared/shared.module";
import { IdentityModule } from "@/modules/identity/identity.module";
import { IncidentsModule } from "@/modules/incidents/incidents.module";
import { UploadService } from "@/modules/assets/application/upload.service";
import { IncidentsService } from "@/modules/incidents/application/incidents.service";
import { IncidentsRepository } from "@/modules/incidents/domain/interfaces/repositories/incidents-repository";
import { PrismaIncidentsRepository } from "@/modules/incidents/infra/prisma-incidents-repository";
import { SocialCoreModule } from "../core/social-core.module";
import { PostVotesController } from "./presentation/post.votes.controller";
import { PostAsyncController } from "./presentation/post-async.controller";
import {
  SOCIAL_POSTS_EVENTS_QUEUE_NAME,
  SocialPostEventsQueuePublisher,
} from "./domain/interfaces/queues/social-post-events-queue";
import { BullQueuePublisher } from "@/modules/shared/infra/bull-queue-publisher";

@Module({
  controllers: [PostController, PostVotesController, PostAsyncController],
  imports: [
    SocialCoreModule,
    BullModule.registerQueue({ name: SOCIAL_POSTS_EVENTS_QUEUE_NAME }),
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
    {
      provide: SocialPostEventsQueuePublisher,
      useFactory: (queue) => new BullQueuePublisher(queue),
      inject: [getQueueToken(SOCIAL_POSTS_EVENTS_QUEUE_NAME)],
    },
    CurseWordsFilterService,
  ],

  exports: [],
})
export class FeedModule {}
