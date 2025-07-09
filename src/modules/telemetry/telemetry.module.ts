import { Module } from "@nestjs/common";
import { TelemetryReportsModule } from "./reports/reports.module";

@Module({
  imports: [TelemetryReportsModule],
})
export class TelemetryModule {}
