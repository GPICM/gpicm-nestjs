import { Module } from "@nestjs/common";
import { WeatherReportsController } from "./weather-reports.controller";
import { MongoDbWeatherRecordsRepository } from "./infra/repositories/mongodb/mongodb-weather-records-repository";

@Module({
  controllers: [WeatherReportsController],
  providers: [MongoDbWeatherRecordsRepository],
  imports: [],
})
export class ReportsModule {}
