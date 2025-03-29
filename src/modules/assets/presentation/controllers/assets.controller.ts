/* eslint-disable @typescript-eslint/require-await */
import {
  Controller,
  Get,
  Param,
  Inject,
  Logger,
  Res,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { BlobStorageRepository } from "@/modules/shared/domain/interfaces/repositories/blob-storage-repository";

@Controller("assets")
export class AssetsController {
  private readonly logger: Logger = new Logger(AssetsController.name);

  constructor(
    @Inject(BlobStorageRepository)
    private readonly blobRepository: BlobStorageRepository
  ) {}

  @Get(":fileName")
  public async getOne(
    @Param("fileName") fileName: string,
    @Res() res: Response
  ) {
    this.logger.log(`Fetching file with name: ${fileName}`);

    const fileStream = this.blobRepository.stream(fileName);
    if (!fileStream) {
      throw new HttpException("File not found", HttpStatus.NOT_FOUND);
    }

    try {
      const metadata = await this.blobRepository.getMetadata(fileName);
      if (!metadata) {
        throw new HttpException("File not found", HttpStatus.NOT_FOUND);
      }

      const contentType = metadata.contentType;

      res.setHeader("Content-Type", contentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(fileName)}"`
      );

      fileStream.pipe(res);

      // Handle errors while streaming
      fileStream.on("error", (err) => {
        this.logger.error(`Error streaming file: ${err.message}`);
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .send("Error streaming file");
      });
    } catch (error: unknown) {
      this.logger.error(`Error fetching file`, { error });
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("An error occurred");
    }
  }
}
