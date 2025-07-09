import { Module } from "@nestjs/common";
import { TelemetryReportsModule } from "./reports/reports.module";
import { StationsModule } from "./stations/stations.module";

@Module({
  imports: [StationsModule, TelemetryReportsModule],
})
export class TelemetryModule {}
