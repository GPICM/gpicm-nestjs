import { randomUUID } from "crypto";
import { BadRequestException, Inject, Logger } from "@nestjs/common";

import { User } from "@/modules/identity/domain/entities/User";

import { IncidentsRepository } from "../domain/interfaces/repositories/incidents-repository";
import { IncidentTypeRepository } from "../domain/interfaces/repositories/incidentType-repository";
import { CreateIncidentDto } from "../presentation/controllers/dtos/create-incident.dto";
import { AuthorSummary } from "../domain/object-values/AuthorSumary";
import { Incident } from "../domain/entities/Incident";

export class IncidentsService {
  private readonly logger: Logger = new Logger(IncidentsService.name);

  constructor(
    @Inject(IncidentsRepository)
    private readonly incidentsRepository: IncidentsRepository,
    @Inject(IncidentTypeRepository)
    private readonly incidentTypeRepository: IncidentTypeRepository
  ) {}

  async create(user: User, dto: CreateIncidentDto): Promise<Incident> {
    try {
      this.logger.log("Creating Incident", { dto });

      const { incidentTypeId } = dto;

      this.logger.log("Looking for incident type", { dto });
      const incidentType =
        await this.incidentTypeRepository.findById(incidentTypeId);

      if (!incidentType) {
        this.logger.log("Invalid incident type", {
          incidentTypeId,
        });
        throw new BadRequestException("Tipo de incidente Invalido");
      }

      this.logger.log("Creating Incident");

      const incident = new Incident({
        id: randomUUID(),
        title: dto.title,
        description: dto.description,
        address: dto.address,
        latitude: dto.latitude,
        longitude: dto.longitude,
        incidentDate: dto.incidentDate,
        observation: dto.observation ?? null,
        reporterName: user?.name ?? "Anonimo",
        incidentType,
        author: new AuthorSummary({
          id: user.id!,
          name: user.name ?? "Anônimo",
          publicId: user.publicId,
        }),
        status: 1,
      });

      await this.incidentsRepository.add(incident);

      this.logger.log("Creating of Incident");

      return incident;
    } catch (error) {
      this.logger.error("Error creating Incident", error);
      throw new Error("Failed to create Incident");
    }
  }
}
