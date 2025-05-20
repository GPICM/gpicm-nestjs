/* eslint-disable prettier/prettier */
import { Controller, Get, Param, Logger, Query, Post, Body, BadRequestException, UseGuards, Delete } from "@nestjs/common";

import { PostRepository } from "../../domain/interfaces/repositories/post-repository";
import { ListPostQueryDto } from "./dtos/list-post.dtos";
import { PaginatedResponse } from "@/modules/shared/domain/protocols/pagination-response";
import { PostLikesRepository } from "../../domain/interfaces/repositories/post-likes-repository";
import {
  CurrentUser,
  JwtAuthGuard,
} from "@/modules/identity/presentation/meta";
import { User } from "@prisma/client";

@Controller("posts")
export class PostController {
  private readonly logger: Logger = new Logger(PostController.name);

  constructor(
    private readonly postRepository: PostRepository,
    private readonly postLikesRepository: PostLikesRepository
  ) {}

  @Get()
  async list(@Query() query: ListPostQueryDto) {
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

    return new PaginatedResponse(records, total, limit, page, filters);
  }

  @Get(":postSlug")
  async getOne(@Param("postSlug") postSlug: string) {
    this.logger.log(`Fetching incident with postSlug: ${postSlug}`);
    return await this.postRepository.findBySlug(postSlug);
  }

  @UseGuards(JwtAuthGuard)
  @Post("like/:postSlug")
  async likePost(
    @Param("postSlug") postSlug: string,
    @CurrentUser() user: User,
  ) {
    const post = await this.postRepository.findBySlug(postSlug)
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


  @UseGuards(JwtAuthGuard)
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
  }

}

