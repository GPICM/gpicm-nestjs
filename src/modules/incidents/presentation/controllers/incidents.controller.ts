/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
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
import {
  BlobStorageRepository,
  BlobStorageRepositoryTypes,
} from "@/modules/shared/domain/interfaces/repositories/blob-storage-repository";
import { FileInterceptor } from "@nestjs/platform-express";
import { PostRepository } from "../../domain/interfaces/repositories/post-repository";
import { AuthorSummary } from "../../domain/object-values/AuthorSumary";

export const MAX_SIZE_IN_BYTES = 3 * 1024 * 1024; // 3MB
const photoValidation = new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({ maxSize: MAX_SIZE_IN_BYTES }),
    new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
  ],
});

@Controller("incidents")
export class IncidentsController {
  private readonly logger: Logger = new Logger(IncidentsController.name);

  constructor(
    @Inject(IncidentsRepository)
    private readonly incidentsRepository: IncidentsRepository,
    @Inject(PostRepository)
    private readonly postRepository: PostRepository,
    @Inject(BlobStorageRepository)
    private readonly blobRepository: BlobStorageRepository
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor("photo"))
  async create(
    @Body() body: CreateIncidentDto,
    @CurrentUser() user: User,
    @UploadedFile(photoValidation) file?: any
  ) {
    try {
      this.logger.log("Creating an incident", { body });

      let imageUrl: string | null = null;
      if (file) {
        imageUrl = await this.uploadImage(user, file);
      }

      const incident = new Incident({
        id: randomUUID(),
        title: body.title,
        description: body.description,
        address: body.address,
        imageUrl: imageUrl,
        imagePreviewUrl: body.imagePreviewUrl ?? null,
        latitude: body.latitude,
        longitude: body.longitude,
        incidentDate: body.incidentDate,
        observation: body.observation ?? null,
        reporterName: user?.name ?? "Anonimo",
        incidentTypeId: body.incidentTypeId,
        author: new AuthorSummary({
          id: user.id!,
          name: user.name ?? "Anônimo",
          profilePicture: user.profilePicture ?? "",
          publicId: user.publicId,
        }),
        status: 1,
      });

      const post = incident.publish();

      await this.incidentsRepository.add(incident);

      await this.postRepository.add(post);

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

  private async uploadImage(user: User, file: any) {
    const fileKey = `${user.id}_${Date.now()}_${file.originalname}`;
    const addParams: BlobStorageRepositoryTypes.AddParams = {
      key: fileKey,
      contentType: file.mimetype,
      buffer: Buffer.from(file.buffer),
    };

    // Add file
    await this.blobRepository.add(addParams);

    const imageUrl = `${process.env.ASSETS_HOST}/${fileKey}`;

    return imageUrl;
  }
}
