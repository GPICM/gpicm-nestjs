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
  Put,
  Delete,
} from "@nestjs/common";
import { IncidentTypeRepository } from "../../domain/interfaces/repositories/incidentType-repository";
import { IncidentType } from "../../domain/entities/IncidentType";
import { CreateIncidentTypeDto } from "./dtos/create-incidentType.dto";
import { JwtAuthGuard } from "@/modules/identity/auth/presentation/meta";
import { UpdateIncidentTypeDto } from "./dtos/update-incidentType.dto";

@Controller("incident-types")
export class IncidentTypeController {
  private readonly logger: Logger = new Logger(IncidentTypeController.name);

  constructor(
    @Inject(IncidentTypeRepository)
    private readonly incidentTypeRepository: IncidentTypeRepository
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: CreateIncidentTypeDto) {
    try {
      this.logger.log("Creating an incident type", { body });

      const newIncidentType = new IncidentType({
        name: body.name,
        description: body.description,
        internalId: body.internalId,
        imageUrl: null,
        slug: "",
      });

      await this.incidentTypeRepository.add(newIncidentType);

      return newIncidentType;
    } catch (error) {
      this.logger.error("Error creating incident type", error);
      throw new BadRequestException("Failed to create incident type");
    }
  }

  @Put(":incidentTypeId")
  @UseGuards(JwtAuthGuard)
  async update(
    @Param("incidentTypeId") incidentTypeId: number,
    @Body() body: UpdateIncidentTypeDto
  ) {
    try {
      this.logger.log(`Updating incident type with id: ${incidentTypeId}`, {
        body,
      });

      const incidentType =
        await this.incidentTypeRepository.findById(incidentTypeId);

      if (!incidentType) {
        throw new BadRequestException("IncidentType not found");
      }

      if (body.name !== undefined) {
        incidentType.name = body.name;
      }

      if (body.description !== undefined) {
        incidentType.description = body.description;
      }

      if (body.internalId !== undefined) {
        incidentType.internalId = body.internalId;
      }

      await this.incidentTypeRepository.update(incidentType);

      return incidentType;
    } catch (error) {
      this.logger.error(
        `Error updating incident type with id: ${incidentTypeId}`,
        error
      );
      throw new BadRequestException("Failed to update incident type");
    }
  }

  @Delete(":incidentTypeId")
  @UseGuards(JwtAuthGuard)
  async delete(@Param("incidentTypeId") incidentTypeId: number) {
    try {
      this.logger.log(`Deleting incident type with id: ${incidentTypeId}`);

      const incidentType =
        await this.incidentTypeRepository.findById(incidentTypeId);

      if (!incidentType) {
        throw new BadRequestException("Incident type not found");
      }

      await this.incidentTypeRepository.delete(incidentTypeId);

      return { message: "Incident type deleted successfully" };
    } catch (error) {
      this.logger.error(
        `Error deleting incident type with id ${incidentTypeId}`,
        error
      );
      throw new BadRequestException("Failed to delete incident type");
    }
  }

  @Get()
  async list() {
    this.logger.log("Fetching all incident types");
    return await this.incidentTypeRepository.listAll();
  }

  @Get(":incidentTypeId")
  async getOne(@Param("incidentTypeId") incidentTypeId: number) {
    this.logger.log(`Fetching incident type with id: ${incidentTypeId}`);
    return await this.incidentTypeRepository.findById(incidentTypeId);
  }
}
