import { Controller, Get, Param, Inject, Logger } from "@nestjs/common";
import { IncidentsRepository } from "../../domain/interfaces/repositories/incidents-repository";
import { IncidentTypeRepository } from "../../domain/interfaces/repositories/incidentType-repository";
import { UploadService } from "@/modules/assets/application/upload.service";

@Controller("incidents")
export class IncidentsController {
  private readonly logger: Logger = new Logger(IncidentsController.name);

  constructor(
    @Inject(IncidentsRepository)
    private readonly incidentsRepository: IncidentsRepository,
    @Inject(IncidentTypeRepository)
    private readonly incidentTypeRepository: IncidentTypeRepository,
    @Inject(UploadService)
    private readonly uploadService: UploadService
  ) {}

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
