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

@Module({
  controllers: [PostController],
  providers: [
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
  ],
  imports: [SharedModule, IncidentsModule],
  exports: [],
})
export class FeedModule {}
