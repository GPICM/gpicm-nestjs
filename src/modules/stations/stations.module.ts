import { Module } from "@nestjs/common";
import { StationsRepository } from "./interfaces/stations-repository";
import { PrismaStationsRepository } from "./infra/repositories/prisma-stations-repository";
import { StationController } from "./stations.controller";

@Module({
  controllers: [StationController],
  providers: [
    {
      provide: StationsRepository,
      useClass: PrismaStationsRepository,
    },
  ],
  imports: [],
})
export class StationsModule {}
