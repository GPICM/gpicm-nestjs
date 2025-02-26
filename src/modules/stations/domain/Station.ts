import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { StationMetricsReport } from "./StationMetricsReport";
import { GeoPosition } from "@/modules/shared/domain/object-values/GeoPosition";

export class Station {
  id: number;

  internalId: string;

  address: string;

  description: string;

  geoPosition: GeoPosition | null;

  isActive: boolean;

  observation: string;

  // Virtual

  isOnline: boolean;

  latestMetrics: StationMetricsReport | null;

  constructor(
    props: NonFunctionProperties<Station>,
    latestMetrics?: StationMetricsReport,
  ) {
    Object.assign(this, props);
    this.latestMetrics = latestMetrics ?? null;
    this.evaluateOnlineStatus();
  }

  private evaluateOnlineStatus() {
    this.isOnline = this.latestMetrics?.isOnline === true;
  }
}
