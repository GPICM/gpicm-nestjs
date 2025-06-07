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

    const { records, count: total } = await this.postRepository.listAll({
      limit,
      offset,
      search: filters.search,
    });

    /*  let recordsWithLike = records;
    if (user && records.length > 0) {
      const postIds = records.map((post: any) => Number(post.id));

      const likedPostIds = await this.postLikesRepository.findLikedPostIdsByUser(user.id, postIds);
      this.logger.log(`User ${user.id} liked posts: ${likedPostIds.join(", ")}`);
      recordsWithLike = records.map((post: any) => ({
        ...post,
        likedByCurrentUser: likedPostIds.includes(Number(post.id)),
      }));
    } */

    return new PaginatedResponse(records, total, limit, page, filters);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":postSlug")
  async getOne(@Param("postSlug") postSlug: string, @CurrentUser() user: User) {
    return this.postService.findOne(postSlug, user);
  }

  /*   @UseGuards(JwtAuthGuard)
  @Patch("vote/:postSlug/:value")
  async likePost(
    @Param("postSlug") postSlug: string,
    @CurrentUser() user: User,
  ) {
    const post = await this.postRepository.findBySlug(postSlug);

    const alreadyLiked = await this.postLikesRepository.exists(Number(post?.id), user.id);

    if (alreadyLiked) {
      throw new BadRequestException("User already liked this post");
    }

    await this.postLikesRepository.create(Number(post?.id), user.id);
    const count = await this.postLikesRepository.countByPost(Number(post?.id));
    await this.postRepository.updateLikesCount(Number(post?.id), count);
    return { message: "Post liked successfully" };
  }


  @UseGuards(JwtAuthGuard)
  @Delete("dislike/:postSlug")
  async removeLikePost(
    @Param("postSlug") postSlug: string,
    @CurrentUser() user: User,
  ) {
    const post = await this.postRepository.findBySlug(postSlug)
    const alreadyLiked = await this.postLikesRepository.exists(Number(post?.id), user.id);

    if (!alreadyLiked) {
      throw new BadRequestException("User didn't like this post");
    }

    await this.postLikesRepository.delete(Number(post?.id), user.id);
    const count = await this.postLikesRepository.countByPost(Number(post?.id));
    await this.postRepository.updateLikesCount(Number(post?.id), count);
    return { message: "Post disliked successfully" };
  }
 */

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
