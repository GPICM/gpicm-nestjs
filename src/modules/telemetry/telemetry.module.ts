import { Module } from "@nestjs/common";
import { TelemetryReportsModule } from "./reports/reports.module";
import { StationsModule } from "./stations/stations.module";
import { MapsModule } from "./maps/maps.module";

@Module({
  imports: [StationsModule, TelemetryReportsModule, MapsModule],
})
export class TelemetryModule {}
