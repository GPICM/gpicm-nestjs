import { Inject, Logger } from "@nestjs/common";
import { IncidentsRepository } from "../domain/interfaces/repositories/incidents-repository";
import { IncidentAssembler } from "./mappers/incident.mapper";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { Incident } from "@/modules/incidents/domain/entities/Incident";

export class PrismaIncidentsRepository implements IncidentsRepository {
  private readonly logger: Logger = new Logger(PrismaIncidentsRepository.name);

  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService
  ) {}

  async add(incident: Incident): Promise<void> {
    try {
      this.logger.log(`Adding new incident: ${incident.title}`);
      await this.prisma.incident.create({
        data: IncidentAssembler.toPrisma(incident),
      });
      this.logger.log(`Incident added successfully: ${incident.id}`);
    } catch (error: unknown) {
      this.logger.error("Failed to add incident", { incident, error });
      throw new Error("Failed to add incident");
    }
  }

  async findById(incidentId: string): Promise<Incident | null> {
    try {
      this.logger.log(`Fetching incident by ID: ${incidentId}`);
      const modelData = await this.prisma.incident.findUnique({
        where: { id: incidentId },
      });

      if (!modelData) {
        this.logger.warn(`Incident not found: ${incidentId}`);
        return null;
      }

      this.logger.log(`Incident found: ${incidentId}`);
      return IncidentAssembler.fromPrisma(modelData);
    } catch (error: unknown) {
      this.logger.error(`Failed to find incident by ID: ${incidentId}`, {
        error,
      });
      throw new Error("Failed to find incident by ID");
    }
  }

  async listAll(): Promise<Incident[]> {
    try {
      this.logger.log("Fetching all incidents...");
      const resultData = await this.prisma.incident.findMany({
        orderBy: { incidentDate: "desc" },
      });

      this.logger.log(`Total incidents found: ${resultData.length}`);
      return IncidentAssembler.fromPrismaMany(resultData);
    } catch (error: unknown) {
      this.logger.error("Failed to list incidents", { error });
      throw new Error("Failed to list incidents");
    }
  }
}
