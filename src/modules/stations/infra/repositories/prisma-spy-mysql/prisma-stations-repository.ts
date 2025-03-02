import { stationInclude, StationMapper } from "./mappers/station.mapper";
import { Inject } from "@nestjs/common";
import { StationsRepository } from "@/modules/stations/interfaces/stations-repository";
import { Station } from "@/modules/stations/domain/Station";
import { PrismaService } from "@/modules/shared/services/prisma-services";

export class PrismaStationsRepository implements StationsRepository {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService
  ) {}

  public async findById(stationId: number): Promise<Station | null> {
    try {
      const stationData = await this.prisma.estacao.findUnique({
        where: { id: stationId },
      });

      return StationMapper.fromPrisma(stationData);
    } catch (error: unknown) {
      console.error("Failed to find station", { error });
      throw new Error("Failed to find station by id");
    }
  }

  public async listAll(): Promise<Station[]> {
    try {
      const result = await this.prisma.estacao.findMany({
        include: stationInclude,
      });

      const stations: Station[] = [];
      for (const data of result) {
        const station = StationMapper.fromPrisma(data);
        if (station) {
          stations.push(station);
        }
      }
      return stations;
    } catch (error: unknown) {
      console.error("Failed to find list stations", { error });
      throw new Error("Failed to lists stations");
    }
  }
}
