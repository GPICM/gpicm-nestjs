import { Module } from "@nestjs/common";
import { SharedModule } from "../shared/shared.module";
import { IncidentsRepository } from "./domain/interfaces/repositories/incidents-repository";
import { PrismaIncidentsRepository } from "./infra/prisma-incidents-repository";
import { IncidentsController } from "./presentation/controllers/incidents.controller";
import { IncidentTypeController } from "./presentation/controllers/incident-types.controller";
import { IncidentTypeRepository } from "./domain/interfaces/repositories/incidentType-repository";
import { PrismaIncidentTypeRepository } from "./infra/prisma-incident-types-repository";
import { AssetsModule } from "../assets/assets.module";

@Module({
  controllers: [IncidentsController, IncidentTypeController],
  providers: [
    /* Incidents */
    {
      provide: IncidentsRepository,
      useClass: PrismaIncidentsRepository,
    },
    {
      provide: IncidentTypeRepository,
      useClass: PrismaIncidentTypeRepository,
    },
  ],
  imports: [SharedModule, AssetsModule],
  exports: [],
})
export class IncidentsModule {}
