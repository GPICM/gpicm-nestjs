import { Module } from "@nestjs/common";
import { InterpolatedMapsController } from "./presentation/controllers/interpolated-maps.controller";
import { InterpolatedMapsRepository } from "./domain/interfaces/interpolated-maps-repository";
import { MongoDbInterpolatedMapsRepository } from "./infra/repositories/mongodb/mongodb-interpolated-maps-repository";

@Module({
  controllers: [InterpolatedMapsController],
  providers: [
    {
      provide: InterpolatedMapsRepository,
      useClass: MongoDbInterpolatedMapsRepository,
    },
  ],
  imports: [],
})
export class MapsModule {}
