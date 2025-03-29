/* eslint-disable @typescript-eslint/require-await */
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Inject,
  Logger,
  BadRequestException,
  UseGuards,
} from "@nestjs/common";
import { IncidentsRepository } from "../../domain/interfaces/repositories/incidents-repository";
import { CreateIncidentDto } from "./dtos/create-incident.dto";
import {
  CurrentUser,
  JwtAuthGuard,
} from "@/modules/identity/presentation/meta";
import { randomUUID } from "crypto";
import { Incident } from "../../domain/entities/Incident";
import { User } from "@/modules/identity/domain/entities/User";

@Controller("incidents")
export class IncidentsController {
  private readonly logger: Logger = new Logger(IncidentsController.name);

  constructor(
    @Inject(IncidentsRepository)
    private readonly incidentsRepository: IncidentsRepository
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: CreateIncidentDto, @CurrentUser() user: User) {
    try {
      this.logger.log("Creating an incident", { body });

      const incident = new Incident({
        id: randomUUID(),
        title: body.title,
        description: body.description,
        address: body.address,
        imageUrl: body.imageUrl ?? null,
        imagePreviewUrl: body.imagePreviewUrl ?? null,
        latitude: body.latitude,
        longitude: body.longitude,
        incidentDate: body.incidentDate,
        observation: body.observation ?? null,
        reporterName: user?.name ?? "Anonimo",
        incidentType: body.incidentType,
        authorId: user.id!,
        status: 1,
      });

      await this.incidentsRepository.add(incident);

      return incident;
    } catch (error) {
      this.logger.error("Error creating incident", error);
      throw new BadRequestException("Failed to create incident");
    }
  }

  @Get()
  async list() {
    this.logger.log("Fetching all incidents");
    return await this.incidentsRepository.listAll();
  }

  @Get(":incidentId")
  async getOne(@Param("incidentId") incidentId: string) {
    this.logger.log(`Fetching incident with id: ${incidentId}`);
    return await this.incidentsRepository.findById(incidentId);
  }
}
