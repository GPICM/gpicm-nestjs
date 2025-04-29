import { Module } from "@nestjs/common";
import { SharedModule } from "../shared/shared.module";
import { IncidentsRepository } from "./domain/interfaces/repositories/incidents-repository";
import { PrismaIncidentsRepository } from "./infra/prisma-incidents-repository";
import { IncidentsController } from "./presentation/controllers/incidents.controller";
import { PostRepository } from "./domain/interfaces/repositories/post-repository";
import { PrismaPostRepository } from "./infra/prisma-post-repository";
import { PostController } from "./presentation/controllers/post.controller";
import { IncidentTypeController } from "./presentation/controllers/incidentType.controller";
import { IncidentTypeRepository } from "./domain/interfaces/repositories/incidentType-repository";
import { PrismaIncidentTypeRepository } from "./infra/prisma-incidentType-repository";

@Module({
  controllers: [IncidentsController, IncidentTypeController, PostController],
  providers: [
    {
      provide: IncidentsRepository,
      useClass: PrismaIncidentsRepository,
    },
    {
      provide: PostRepository,
      useClass: PrismaPostRepository,
    },
    {
      provide: IncidentTypeRepository,
      useClass: PrismaIncidentTypeRepository
    }
  ],
  imports: [SharedModule],
  exports: [],
})
export class IncidentsModule {}
