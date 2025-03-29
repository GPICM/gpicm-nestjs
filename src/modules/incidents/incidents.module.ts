import { Module } from "@nestjs/common";
import { SharedModule } from "../shared/shared.module";

import { IncidentsRepository } from "./domain/interfaces/repositories/incidents-repository";
import { PrismaIncidentsRepository } from "./infra/prisma-incidents-repository";
import { IncidentsController } from "./presentation/controllers/incidents.controller";
import { PostRepository } from "./domain/interfaces/repositories/post-repository";
import { PrismaPostRepository } from "./infra/prisma-post-repository";
import { PostController } from "./presentation/controllers/post.controller";

@Module({
  controllers: [IncidentsController, PostController],
  providers: [
    {
      provide: IncidentsRepository,
      useClass: PrismaIncidentsRepository,
    },
    {
      provide: PostRepository,
      useClass: PrismaPostRepository,
    },
  ],
  imports: [SharedModule],
  exports: [],
})
export class IncidentsModule {}
