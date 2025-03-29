import { Module } from "@nestjs/common";
import { SharedModule } from "../shared/shared.module";

import { IncidentsRepository } from "./domain/interfaces/repositories/incidents-repository";
import { PrismaIncidentsRepository } from "./infra/prisma-incidents-repository";
import { IncidentsController } from "./presentation/controllers/incidents.controller";
@Module({
  controllers: [IncidentsController],
  providers: [
    {
      provide: IncidentsRepository,
      useClass: PrismaIncidentsRepository,
    },
  ],
  imports: [SharedModule],
  exports: [],
})
export class IncidentsModule {}
