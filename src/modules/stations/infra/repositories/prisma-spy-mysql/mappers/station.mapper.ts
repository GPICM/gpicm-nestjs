import { GeoPosition } from "@/modules/shared/domain/object-values/GeoPosition";
import { Station } from "@/modules/stations/domain/Station";
import { Prisma } from "@prisma/client";

export const stationInclude = Prisma.validator<Prisma.EstacaoInclude>()({});

type PrismaJoinModel = Prisma.EstacaoGetPayload<{
  include: typeof stationInclude;
}>;

class StationMapper {
  public static fromPrisma(
    prismaData?: PrismaJoinModel | null
  ): Station | null {
    if (!prismaData) return null;

    let geoPosition: GeoPosition | null = null;
    if (prismaData.latitude && prismaData.longitude) {
      try {
        geoPosition = new GeoPosition(
          prismaData.latitude,
          prismaData.longitude
        );
      } catch (error: unknown) {
        console.error("Invalid geo position", { error });
      }
    }

    return new Station({
      geoPosition,
      isActive: prismaData.ativa,
      internalId: prismaData.id,
      slug: prismaData.identificador,
      address: prismaData.endereco ?? "",
      description: prismaData.descricao ?? "",
      observation: prismaData.obs ?? "",
      isOnline: false,
      latestMetrics: null,
    });
  }
}

export { StationMapper };
