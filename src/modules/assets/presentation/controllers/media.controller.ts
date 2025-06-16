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
import { ImageTargetEnum } from "../../domain/enums/image-target-enum";

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
      this.logger.log("Uploading image to media", { body });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const buffer = Buffer.from(file.buffer);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const contentType = file.mimetype;

      const result = await this.mediaService.uploadMedia(
        user,
        buffer,
        MediaTypeEnum.IMAGE,
        contentType,
        {
          altText: body.altText,
          caption: body.caption,
          imageTargetConfig: ImageTargetEnum.POSTS_GENERIC_IMAGE
        }
      );
      return result;
    } catch (error: unknown) {
      this.logger.error("Error creating post", { error });
      throw new BadRequestException("Failed to create post");
    }
  }
}
