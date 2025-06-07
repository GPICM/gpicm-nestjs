/* eslint-disable prettier/prettier */
import {
  Controller,
  Logger,
  Body,
  BadRequestException,
  UseGuards,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UploadedFile,
  Post as PostMethod,
  Get,
  Query,
  Param,
  Patch,
} from "@nestjs/common";

import {
  CurrentUser,
  JwtAuthGuard,
} from "@/modules/identity/presentation/meta";
import { FileInterceptor } from "@nestjs/platform-express";
import { CreatePostDto } from "./dtos/create-post.dto";
import { UploadService } from "@/modules/assets/application/upload.service";
import { User } from "@/modules/identity/domain/entities/User";
import { PostRepository } from "../domain/interfaces/repositories/post-repository";
import { PaginatedResponse } from "@/modules/shared/domain/protocols/pagination-response";
import { ListPostQueryDto } from "./dtos/list-post.dtos";
import { PostServices } from "../application/post.service";

export const MAX_SIZE_IN_BYTES = 3 * 1024 * 1024; // 3MB

const photoValidation = new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({ maxSize: MAX_SIZE_IN_BYTES }),
    new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
  ],
});

@Controller("posts")
@UseGuards(JwtAuthGuard)
export class PostController {
  private readonly logger: Logger = new Logger(PostController.name);

  constructor(
    private readonly uploadService: UploadService,
    private readonly postRepository: PostRepository,
    private readonly postService: PostServices
  ) {}

  @PostMethod()
  @UseInterceptors(FileInterceptor("photo"))
  async create(
    @Body() body: CreatePostDto,
    @CurrentUser() user: User,
    @UploadedFile(photoValidation) file?: any
  ) {
    try {
      this.logger.log("Starting post creation", { body });

      if (file) {
        this.logger.log("Uploading image", { body });
        body.imageUrl = await this.uploadService.uploadImage(user, file);
      }

      this.logger.log("Creating an post", { body });

      const post = await this.postService.create(user, body);

      return post;
    } catch (error: unknown) {
      this.logger.error("Error creating post", { error });
      throw new BadRequestException("Failed to create post");
    }
  }

  @Get()
  async list(@Query() query: ListPostQueryDto, @CurrentUser() user: User) {
    this.logger.log("Fetching all posts");

    const filters = {
      page: query.page,
      limit: query.limit,
      search: query.search,
    };

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 16;
    const offset = limit * (page - 1);

    const { records, count: total } = await this.postRepository.listAll(
      {
        limit,
        offset,
        search: filters.search,
      },
      user.id!
    );

    return new PaginatedResponse(records, total, limit, page, filters);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":postSlug")
  getOne(@Param("postSlug") postSlug: string, @CurrentUser() user: User) {
    return this.postService.findOne(postSlug, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":postSlug/vote/up")
  async upVote(
    @Param("postSlug") postSlug: string,
    @CurrentUser() user: User
  ) {
    return this.postService.vote(user, postSlug, 1);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":postSlug/vote/down")
  async downVote(
    @Param("postSlug") postSlug: string,
    @CurrentUser() user: User
  ) {
    return this.postService.vote(user, postSlug, -1);
  }

  /*   @UseGuards(JwtAuthGuard)
  @Get("listLikes/:postSlug")
  async listLikesPost(
    @Param("postSlug") postSlug: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const post = await this.postRepository.findBySlug(postSlug);
    const postId = Number(post?.id);

    if (!postId) {
      throw new BadRequestException("Post não encontrado");
    }

    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 20;

    const [likes, total] = await Promise.all([
      this.postLikesRepository.findByPost(postId, limitNumber, (pageNumber - 1) * limitNumber),
      this.postLikesRepository.countByPost(postId),
    ]);

    return {
      data: likes,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limit),
    };
  } */
}
