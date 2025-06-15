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
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  CurrentUser,
  GuestGuard,
  JwtAuthGuard,
} from "@/modules/identity/presentation/meta";
import { User } from "@/modules/identity/domain/entities/User";
import { UploadService } from "../../application/upload.service";
import { UserGuard } from "@/modules/identity/presentation/meta/guards/user.guard";

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
    @Inject(UploadService)
    private readonly uploadService: UploadService
  ) {}

  // @UseGuards(UserGuard)
  @Post()
  @UseInterceptors(FileInterceptor("image"))
  async create(
    @CurrentUser() user: User,
    @UploadedFile(imageValidation) file?: any
  ) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await this.uploadService.uploadImage(user, file, "users");

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return result;
    } catch (error: unknown) {
      this.logger.error("Error creating post", { error });
      throw new BadRequestException("Failed to create post");
    }
  }
}
