/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/require-await */
import {
  Controller,
  Inject,
  Logger,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
  Body,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  CurrentUser,
  JwtAuthGuard,
} from "@/modules/identity/presentation/meta";
import { User } from "@/modules/identity/domain/entities/User";
import { MediaService } from "../../application/media.service";
import { MediaTypeEnum } from "../../domain/entities/Media";
import { UploadMediaDto } from "../dtos/create-media.dto";

export const MAX_SIZE_IN_BYTES = 3 * 1024 * 1024; // 3MB

const imageValidation = new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({ maxSize: MAX_SIZE_IN_BYTES }),
    new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
  ],
});

@Controller("medias")
@UseGuards(JwtAuthGuard)
export class MediaController {
  private readonly logger: Logger = new Logger(MediaController.name);

  constructor(
    @Inject(MediaService)
    private readonly mediaService: MediaService
  ) {}

  @Post("/images/upload")
  @UseInterceptors(FileInterceptor("image"))
  async uploadImage(
    @CurrentUser() user: User,
    @UploadedFile(imageValidation) file: any,
    @Body() body: UploadMediaDto
  ) {
    try {
      this.logger.log("Uploading media image", { body });
      const buffer = Buffer.from(file.buffer);
      const contentType = file.mimetype;

      const result = await this.mediaService.uploadMedia(
        user,
        buffer as Buffer,
        MediaTypeEnum.IMAGE,
        contentType as string,
        {
          altText: body.altText,
          caption: body.caption,
          imageTargetConfig: body.target,
        }
      );
      return result;
    } catch (error: unknown) {
      this.logger.error("Error Creating media image", { error });
      throw new BadRequestException("Failed to create media image");
    }
  }
}
