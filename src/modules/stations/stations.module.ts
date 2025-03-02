import { Module } from "@nestjs/common";
import { StationsRepository } from "./interfaces/stations-repository";
import { StationController } from "./stations.controller";
import { MongoDbStationsRepository } from "./infra/repositories/mongodb/mongodb-stations-repository";

@Module({
  controllers: [StationController],
  providers: [
    {
      provide: StationsRepository,
      useClass: MongoDbStationsRepository,
    },
  ],
  imports: [],
})
export class StationsModule {}
