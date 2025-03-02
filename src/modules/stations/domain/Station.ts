import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { GeoPosition } from "@/modules/shared/domain/object-values/GeoPosition";

export class Station {
  internalId: number;

  slug: string;

  address: string;

  description: string;

  geoPosition: GeoPosition | null;

  isActive: boolean;

  observation: string;

  // Virtual

  isOnline: boolean;

  latestMetrics: Record<string, unknown> | null = null;

  constructor(props: NonFunctionProperties<Station>) {
    Object.assign(this, props);
    this.evaluateOnlineStatus();
  }

  private evaluateOnlineStatus() {
    this.isOnline = this.latestMetrics?.isOnline === true;
  }

  public toJSON() {
    const { latestMetrics, geoPosition, ...rest } = this;
    return { ...rest, geoPosition, latestMetrics };
  }
}
