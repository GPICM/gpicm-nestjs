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
} from "@/modules/identity/auth/presentation/meta";
import { User } from "@/modules/identity/core/domain/entities/User";
import { MediaService } from "../../application/media.service";
import { MediaTypeEnum } from "../../domain/entities/Media";
import { UploadMediaDto } from "../dtos/create-media.dto";

export const MAX_SIZE_IN_BYTES = 10 * 1024 * 1024; // 10MB

const imageValidation = new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({ maxSize: MAX_SIZE_IN_BYTES }),
    new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
  ],
});

const audioValidation = new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({ maxSize: MAX_SIZE_IN_BYTES }),
    new FileTypeValidator({ fileType: /^audio\/(mpeg|mp3|wav|ogg)$/ }),
  ],
});

const videoValidation = new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({ maxSize: MAX_SIZE_IN_BYTES }),
    new FileTypeValidator({ fileType: /(mp4|webm)$/ }),
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

  @Post("/image/upload")
  @UseInterceptors(FileInterceptor("file"))
  async uploadImage(
    @CurrentUser() user: User,
    @UploadedFile(imageValidation) file: any,
    @Body() body: UploadMediaDto
  ) {
    return this.handleUpload(user, file, MediaTypeEnum.IMAGE, body);
  }

  @Post("/audio/upload")
  @UseInterceptors(FileInterceptor("file"))
  async uploadAudio(
    @CurrentUser() user: User,
    @UploadedFile(audioValidation) file: any,
    @Body() body: UploadMediaDto
  ) {
    return this.handleUpload(user, file, MediaTypeEnum.AUDIO, body);
  }

  @Post("/video/upload")
  @UseInterceptors(FileInterceptor("file"))
  async uploadVideo(
    @CurrentUser() user: User,
    @UploadedFile(videoValidation) file: any,
    @Body() body: UploadMediaDto
  ) {
    return this.handleUpload(user, file, MediaTypeEnum.VIDEO, body);
  }

  private async handleUpload(
    user: User,
    file: any,
    mediaType: MediaTypeEnum,
    body: UploadMediaDto
  ) {
    try {
      this.logger.log(`Uploading ${mediaType}`, { body });
      const buffer = Buffer.from(file.buffer) as Buffer;
      const contentType = String(file.mimetype);

      const result = await this.mediaService.uploadMedia(
        user,
        buffer,
        mediaType,
        contentType,
        {
          altText: body?.altText,
          caption: body?.caption,
          imageTargetConfig: body?.target,
        }
      );

      return result;
    } catch (error: unknown) {
      this.logger.error(`Error creating media ${mediaType}`, { error });
      throw new BadRequestException(`Failed to upload ${mediaType}`);
    }
  }
}
