import { GeoPosition } from "@/modules/shared/domain/object-values/GeoPosition";
import { Station } from "@/modules/telemetry/stations/domain/Station";

import { MongoStation } from "#database/mongodb/schemas/stations";
import { MongoStationDailyMetrics } from "#database/mongodb/schemas/station-daily-metrics";

export type MongoStationProjection = MongoStation & {
  latestMetrics: MongoStationDailyMetrics | null;
};
class MongoDbStationMapper {
  public static fromMongo(
    data?: MongoStationProjection | null
  ): Station | null {
    if (!data) return null;

    let geoPosition: GeoPosition | null = null;
    if (data.geoPosition) {
      try {
        geoPosition = new GeoPosition(
          data.geoPosition.coordinates[1],
          data.geoPosition.coordinates[0]
        );
      } catch (error: unknown) {
        console.error("Invalid geo position", { error });
      }
    }

    const latestMetrics = data.latestMetrics ?? null;

    return new Station({
      geoPosition,
      slug: data.slug,
      isActive: data.isActive,
      internalId: data.internalId,
      address: data.address ?? "",
      description: data.description ?? "",
      observation: data.observation ?? "",
      latestMetrics: latestMetrics as unknown as Record<string, unknown>,
      isOnline: latestMetrics?.isOnline === true,
    });
  }
}

export { MongoDbStationMapper };
