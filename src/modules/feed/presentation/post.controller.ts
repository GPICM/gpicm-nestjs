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
import { PostVotesRepository } from "../domain/interfaces/repositories/post-votes-repository";

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
    private readonly postVotes: PostVotesRepository,
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

      this.logger.log("Post successfully created", { post });
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

  @Get(":postSlug")
  getOne(@Param("postSlug") postSlug: string, @CurrentUser() user: User) {
    return this.postService.findOne(postSlug, user);
  }

  @Patch(":uuid/vote/up")
  async upVote(
    @Param("uuid") uuid: string,
    @CurrentUser() user: User
  ) {
    return this.postService.vote(user, uuid, 1);
  }

  @Patch(":uuid/vote/down")
  async downVote(
    @Param("uuid") uuid: string,
    @CurrentUser() user: User
  ) {
    return this.postService.vote(user, uuid, -1);
  }

  @Get(":uuid/likes")
  async listPostVotes(
    @Param("uuid") uuid: string,
    @Query() query: ListPostQueryDto,
    @CurrentUser() user: User,
  ) {
    const post = await this.postRepository.findByUuid(uuid, user.id!);

    if (!post?.id) {
      throw new BadRequestException("Post não encontrado");
    }

    const postId = Number(post?.id);

    const filters = {
      page: query.page,
      limit: query.limit,
      search: query.search,
    };

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 16;
    const offset = limit * (page - 1);

    const { records, count: total } = await this.postVotes.listAllByPostId(
      postId,
      {
        limit,
        offset,
        search: filters.search,
      },
    );

    return new PaginatedResponse(records, total, limit, page, filters);
  }
}
