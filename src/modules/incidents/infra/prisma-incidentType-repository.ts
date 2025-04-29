import { Inject, Logger } from "@nestjs/common";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { IncidentType } from "@/modules/incidents/domain/entities/incidentType";

import { IncidentTypeAssembler } from "./mappers/incidentType.mapper";

import { IncidentTypeRepository } from "../domain/interfaces/repositories/incidentType-repository";

export class PrismaIncidentTypeRepository implements IncidentTypeRepository {
  private readonly logger: Logger = new Logger(
    PrismaIncidentTypeRepository.name
  );

  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService
  ) {}

  async add(incidentType: IncidentType): Promise<void> {
    try {
      this.logger.log(`Adding new incident type: ${incidentType.name}`);

      await this.prisma.incidentTypes.create({
        data: IncidentTypeAssembler.toPrisma(incidentType),
      });

      this.logger.log(`Incident type added successfully: ${incidentType.id}`);
    } catch (error: unknown) {
      this.logger.error("Failed to add incident type", { incidentType, error });
      throw new Error("Failed to add incident type");
    }
  }

  async update(incidentType: IncidentType): Promise<void> {
    try {
      this.logger.log(`Updating incident type: ${incidentType.id}`);
      await this.prisma.incidentTypes.update({
        where: { id: incidentType.id },
        data: IncidentTypeAssembler.toPrisma(incidentType),
      });
      this.logger.log(`Incident type updated successfully: ${incidentType.id}`);
    } catch (error: unknown) {
      this.logger.error(`Failed to update incident type: ${incidentType.id}`, {
        error,
      });
      throw new Error("Failed to update incident type");
    }
  }

  async delete(incidentTypeId: number): Promise<void> {
    try {
      this.logger.log(`Deleting incident type: ${incidentTypeId}`);
      await this.prisma.incidentTypes.delete({
        where: { id: incidentTypeId },
      });
      this.logger.log(`Incident type deleted successfully: ${incidentTypeId}`);
    } catch (error: unknown) {
      this.logger.error(`Failed to delete incident type: ${incidentTypeId}`, {
        error,
      });
      throw new Error("Failed to delete incident type");
    }
  }

  async findById(incidentTypeId: number): Promise<IncidentType | null> {
    try {
      this.logger.log(`Fetching incident type by ID: ${incidentTypeId}`);
      const modelData = await this.prisma.incidentTypes.findUnique({
        where: { id: incidentTypeId },
      });

      if (!modelData) {
        this.logger.warn(`Incident type not found: ${incidentTypeId}`);
        return null;
      }

      this.logger.log(`Incident type found: ${incidentTypeId}`);
      return IncidentTypeAssembler.fromPrisma(modelData);
    } catch (error: unknown) {
      this.logger.error(
        `Failed to find incident type by ID: ${incidentTypeId}`,
        { error }
      );
      throw new Error("Failed to find incident type by ID");
    }
  }

  async listAll(): Promise<IncidentType[]> {
    try {
      this.logger.log("Fetching all incident types...");
      const resultData = await this.prisma.incidentTypes.findMany({
        orderBy: { name: "asc" },
      });

      this.logger.log(`Total incident types found: ${resultData.length}`);
      return IncidentTypeAssembler.fromPrismaMany(resultData);
    } catch (error: unknown) {
      this.logger.error("Failed to list incident types", { error });
      throw new Error("Failed to list incident types");
    }
  }
}
