/* eslint-disable prettier/prettier */
import {
  Controller,
  Logger,
  Body,
  BadRequestException,
  UseGuards,
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
import { CreatePostDto } from "./dtos/create-post.dto";
import { User } from "@/modules/identity/domain/entities/User";
import { PostRepository } from "../domain/interfaces/repositories/post-repository";
import { PaginatedResponse } from "@/modules/shared/domain/protocols/pagination-response";
import { ListPostQueryDto } from "./dtos/list-post.dtos";
import { PostServices } from "../application/post.service";
import { PostVotesRepository } from "../domain/interfaces/repositories/post-votes-repository";
import { UserGuard } from "@/modules/identity/presentation/meta/guards/user.guard";
import { PostMediaService } from "../application/post-media.service";

@Controller("posts")
@UseGuards(JwtAuthGuard)
export class PostController {
  private readonly logger: Logger = new Logger(PostController.name);

  constructor(
    private readonly postRepository: PostRepository,
    private readonly postVotes: PostVotesRepository,
    private readonly postMedias: PostMediaService,
    private readonly postService: PostServices
  ) {}

  @PostMethod()
  @UseGuards(UserGuard)
  async create(@Body() body: CreatePostDto, @CurrentUser() user: User) {
    try {
      this.logger.log("Starting post creation", { body });

      const post = await this.postService.create(user, body);

      this.logger.log("Post successfully created", { post });
      return;
    } catch (error: unknown) {
      this.logger.error("Error creating post", { error });
      throw new BadRequestException("Failed to create post");
    }
  }

  @Get()
  async list(@Query() query: ListPostQueryDto, @CurrentUser() user: User) {
    this.logger.log("Fetching all posts");

    // TODO: IMPLEMENT GEO LOCATION AND SCORE FILTERS
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

  @Get("hot")
  async listHot(@Query() query: ListPostQueryDto, @CurrentUser() user: User) {
    this.logger.log("Fetching all posts");

    // TODO: IMPLEMENT GEO LOCATION AND SCORE FILTERS
    const filters = {
      page: query.page,
      limit: query.limit,
      search: query.search,
    };

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 16;
    const offset = limit * (page - 1);

    const { records, count: total } = await this.postRepository.listByRelevance(
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
  async upVote(@Param("uuid") uuid: string, @CurrentUser() user: User) {
    return this.postService.vote(user, uuid, 1);
  }

  @Patch(":uuid/vote/down")
  async downVote(@Param("uuid") uuid: string, @CurrentUser() user: User) {
    return this.postService.vote(user, uuid, -1);
  }

  @Get(":uuid/votes")
  @UseGuards(UserGuard)
  async listPostVotes(
    @Param("uuid") uuid: string,
    @Query() query: ListPostQueryDto,
    @CurrentUser() user: User
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
      }
    );

    return new PaginatedResponse(records, total, limit, page, filters);
  }

  @Get(":uuid/medias")
  async listPostMedias(@Param("uuid") uuid: string, @CurrentUser() user: User) {
    return await this.postMedias.listMediasByPostUuid(user, uuid);
  }
}
