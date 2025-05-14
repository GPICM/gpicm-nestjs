import { Module } from "@nestjs/common";
import { SharedModule } from "../shared/shared.module";
import { IncidentsRepository } from "./domain/interfaces/repositories/incidents-repository";
import { PrismaIncidentsRepository } from "./infra/prisma-incidents-repository";
import { IncidentsController } from "./presentation/controllers/incidents.controller";
import { PostRepository } from "./domain/interfaces/repositories/post-repository";
import { PrismaPostRepository } from "./infra/prisma-post-repository";
import { PostController } from "./presentation/controllers/post.controller";
import { IncidentTypeController } from "./presentation/controllers/incident-types.controller";
import { IncidentTypeRepository } from "./domain/interfaces/repositories/incidentType-repository";
import { PrismaIncidentTypeRepository } from "./infra/prisma-incident-types-repository";

@Module({
  controllers: [IncidentsController, IncidentTypeController, PostController],
  providers: [
    /* todo: criar um modulo para post depois */
    {
      provide: PostRepository,
      useClass: PrismaPostRepository,
    },
    /* Incidnets */
    {
      provide: IncidentsRepository,
      useClass: PrismaIncidentsRepository,
    },
    {
      provide: IncidentTypeRepository,
      useClass: PrismaIncidentTypeRepository,
    },
  ],
  imports: [SharedModule],
  exports: [],
})
export class IncidentsModule {}
