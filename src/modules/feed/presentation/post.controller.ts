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
  Post,
  Delete,
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
import { CreatePostCommentDto } from "../presentation/dtos/create-post-comment.dto";
import { UpdateCommentDto } from "../presentation/dtos/update-post-comment.dto";
import { ListPostCommentsDto } from "../presentation/dtos/list-post-comments.dto";
import { PostCommentRepository } from "../domain/interfaces/repositories/post-comment-repository";
import { PostCommentsService } from "../application/post-comment.service";
import { PostSortBy } from "../domain/enum/OrderBy";

@Controller("posts")
@UseGuards(JwtAuthGuard)
export class PostController {
  private readonly logger: Logger = new Logger(PostController.name);

  constructor(
    private readonly postRepository: PostRepository,
    private readonly postVotes: PostVotesRepository,
    private readonly postMedias: PostMediaService,
    private readonly postService: PostServices,
    private readonly postCommentService: PostCommentsService,
    private readonly postCommentRepository: PostCommentRepository
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
    this.logger.log("Fetching all posts", { query });

    // TODO: IMPLEMENT GEO LOCATION AND SCORE FILTERS
    const page = query.page ?? 1;
    const limit = query.limit ?? 16;
    const offset = limit * (page - 1);

    if(query.startDate && query.endDate){
      query.startDate.setHours(0,0,0,0);
      query.endDate.setHours(23,59,59,999);
    }

    const { records, count: total } = await this.postRepository.listAll(
      {
        limit,
        offset,
        tags: query.tags,
        search: query.search,
        endDate: query.endDate,
        startDate: query.startDate,
        sortBy: query.sortBy
      },
      user.id
    );

    return new PaginatedResponse(records, total, limit, page, {});
  }

  @Get("hot")
  async listHot(@Query() query: ListPostQueryDto, @CurrentUser() user: User) {
    this.logger.log("Fetching all posts", { query });

    // TODO: IMPLEMENT GEO LOCATION AND SCORE FILTERS
    const page = query.page ?? 1;
    const limit = query.limit ?? 16;
    const offset = limit * (page - 1);

    if(query.startDate && query.endDate){
      query.startDate.setHours(0,0,0,0);
      query.endDate.setHours(23,59,59,999);
    }

    const { records, count: total } = await this.postRepository.listAll(
      {
        limit,
        offset,
        tags: query.tags,
        search: query.search,
        endDate: query.endDate,
        startDate: query.startDate,
        sortBy: PostSortBy.MOST_POPULAR,
      },
      user.id
    );

    return new PaginatedResponse(records, total, limit, page, {});
  }

  @Get(":postSlug")
  async getOne(@Param("postSlug") postSlug: string, @CurrentUser() user: User) {

    let post = await this.postService.findOne(postSlug, user);

    if(post != null){
      await this.postService.IncrementViews(post, user);

      post = await this.postService.findOne(postSlug, user);
    }
    
    return post;
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
    const post = await this.postRepository.findByUuid(uuid, user.id);

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

  @UseGuards(UserGuard)
  @Post(":postUuid/comments")
  async createComment(
    @Param("postUuid") postUuid: string,
    @Body() body: CreatePostCommentDto,
    @CurrentUser() user: User
  ) {
    return this.postCommentService.addComment(postUuid, body, user);
  }

  @UseGuards(UserGuard)
  @Patch("comments/:commentId")
  async updateComment(
    @Param("commentId") commentId: string,
    @Body() body: UpdateCommentDto,
    @CurrentUser() user: User
  ) {
    return this.postCommentService.updateComment(
      Number(commentId),
      body.content,
      user
    );
  }

  @UseGuards(UserGuard)
  @Delete("comments/:commentId")
  async deleteComment(
    @Param("commentId") commentId: string,
    @CurrentUser() user: User
  ) {
    await this.postCommentService.deleteComment(Number(commentId), user);
    return { message: "Comentário excluído com sucesso" };
  }

  @Get(":postUuid/comments")
  async listComments(
    @Param("postUuid") postUuid: string,
    @Query() query: ListPostCommentsDto,
    @CurrentUser() user: User
  ) {
    const post = await this.postRepository.findByUuid(postUuid, user.id);
    if (!post?.id) {
      throw new BadRequestException("Post não encontrado");
    }

    const postId = Number(post?.id);
    const page = query.page ?? 1;
    const limit = query.limit ?? 16;
    const offset = limit * (page - 1);

    const { records, count: total } =
      await this.postCommentRepository.listAllByPostId(postId, {
        limit,
        offset,
        parentId: query.parentId ?? null
      });

    return new PaginatedResponse(records, total, limit, page, {});
  }
}
