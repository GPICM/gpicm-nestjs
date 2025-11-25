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
  NotFoundException,
} from "@nestjs/common";

import {
  CurrentUser,
  JwtAuthGuard,
} from "@/modules/identity/auth/presentation/meta";
import { CreatePostDto } from "./dtos/create-post.dto";
import { User } from "@/modules/identity/core/domain/entities/User";
import { PostRepository } from "../domain/interfaces/repositories/post-repository";
import { PaginatedResponse } from "@/modules/shared/domain/protocols/pagination-response";
import { ListPostQueryDto } from "./dtos/list-post.dtos";
import { PostServices } from "../application/post.service";
import { ActiveUserGuard } from "@/modules/identity/auth/presentation/meta/guards/active-user.guard";
import { PostMediaService } from "../application/post-media.service";
import { CreatePostCommentDto } from "../presentation/dtos/create-post-comment.dto";
import { UpdateCommentDto } from "../presentation/dtos/update-post-comment.dto";
import { ListPostCommentsDto } from "../presentation/dtos/list-post-comments.dto";
import { PostCommentRepository } from "../domain/interfaces/repositories/post-comment-repository";
import { PostCommentsService } from "../application/post-comment.service";
import { PostSortBy } from "../domain/enum/OrderBy";
import { SocialProfileGuard } from "../../core/infra/guards/SocialProfileGuard";
import { CurrentProfile } from "../../core/infra/decorators/profile.decorator";
import { Profile } from "../../core/domain/entities/Profile";
import { ProfileRepository } from "../../core/domain/interfaces/repositories/profile-repository";

@Controller("posts")
@UseGuards(JwtAuthGuard)
export class PostController {
  private readonly logger: Logger = new Logger(PostController.name);

  constructor(
    private readonly postRepository: PostRepository,
    private readonly postMedias: PostMediaService,
    private readonly postService: PostServices,
    private readonly postCommentService: PostCommentsService,
    private readonly postCommentRepository: PostCommentRepository,
    private readonly profileRepository: ProfileRepository
  ) {}

  @PostMethod()
  @UseGuards(ActiveUserGuard, SocialProfileGuard())
  async create(
    @Body() body: CreatePostDto,
    @CurrentUser() user: User,
    @CurrentProfile() profile: Profile
  ) {
    try {
      this.logger.log("Starting post creation", { body });

      const post = await this.postService.create(user, profile, body);

      this.logger.log("Post successfully created", { post });
      return;
    } catch (error: unknown) {
      this.logger.error("Error creating post", { error });
      throw new BadRequestException("Failed to create post");
    }
  }

  @Get()
  @UseGuards(SocialProfileGuard({ optional: true }))
  async list(
    @Query() query: ListPostQueryDto,
    @CurrentUser() user: User,
    @CurrentProfile() profile: Profile
  ) {
    this.logger.log("Fetching all posts", { query });

    const page = query.page ?? 1;
    const limit = query.limit ?? 16;
    const offset = limit * (page - 1);

    if (query.startDate && query.endDate) {
      query.startDate.setHours(0, 0, 0, 0);
      query.endDate.setHours(23, 59, 59, 999);
    }

    const { records, count: total } = await this.postRepository.listAll(
      {
        limit,
        offset,
        tags: query.tags,
        search: query.search,
        endDate: query.endDate,
        startDate: query.startDate,
        sortBy: query.sortBy,
      },
      user.id,
      profile?.id
    );

    return new PaginatedResponse(records, total, limit, page, {});
  }

  @Delete(":postUuid")
  @UseGuards(ActiveUserGuard, SocialProfileGuard())
  async delete(@Param("postUuid") postUuid: string, @CurrentUser() user: User) {
    this.logger.log("Deleting post", { postUuid });
    const post = await this.postRepository.findByUuid(postUuid, user.id);
    if (post?.author.id !== user.id && !user.isAdmin) {
      throw new BadRequestException("You are not allowed to delete this post");
    }
    if (!post) {
      throw new NotFoundException("Post not found");
    }
    await this.postRepository.delete(post);
  }

  @Get("author/:handle")
  @UseGuards(SocialProfileGuard())
  async listAllPostsByAuthor(
    @Param("handle") authorHandle: string,
    @Query() query: ListPostQueryDto,
    @CurrentUser() user: User,
    @CurrentProfile() profile?: Profile
  ) {
    const author = await this.profileRepository.findByHandle(authorHandle);
    if (!author) throw new NotFoundException("Author not found");

    this.logger.log(`Fetching all posts by author ${authorHandle}`);

    const page = query.page ?? 1;
    const limit = query.limit ?? 16;
    const offset = limit * (page - 1);

    const { records, count: total } = await this.postRepository.listAll(
      {
        limit,
        offset,
        tags: query.tags,
        search: query.search,
        endDate: query.endDate,
        startDate: query.startDate,
        sortBy: PostSortBy.MOST_POPULAR,
        authorId: author.id,
      },
      user.id,
      profile?.id
    );
    return new PaginatedResponse(records, total, limit, page, {});
  }

  @Get(":postSlug")
  @UseGuards(SocialProfileGuard({ optional: true }))
  async getOne(
    @Param("postSlug") postSlug: string,
    @CurrentUser() user: User,
    @CurrentProfile() profile?: Profile
  ) {
    console.log(profile);
    const post = await this.postService.findOne(postSlug, user, profile);

    return post;
  }

  @Get("uuid/:postUuid")
  async getOneInternal(
    @Param("postUuid") postUuid: string,
    @CurrentUser() user: User
  ) {
    const post = await this.postService.findOneByUuid(postUuid, user);
    return post;
  }

  @Get(":uuid/medias")
  async listPostMedias(@Param("uuid") uuid: string, @CurrentUser() user: User) {
    return await this.postMedias.listMediasByPostUuid(user, uuid);
  }

  @UseGuards(ActiveUserGuard, SocialProfileGuard())
  @Post(":postUuid/comments")
  async createComment(
    @Param("postUuid") postUuid: string,
    @Body() body: CreatePostCommentDto,
    @CurrentUser() user: User,
    @CurrentProfile() profile: Profile
  ) {
    return this.postCommentService.addComment(profile, postUuid, body);
  }

  @UseGuards(ActiveUserGuard, SocialProfileGuard())
  @Patch("comments/:commentId")
  async updateComment(
    @Param("commentId") commentId: string,
    @Body() body: UpdateCommentDto,
    @CurrentUser() user: User,
    @CurrentProfile() profile: Profile
  ) {
    return this.postCommentService.updateComment(
      profile,
      Number(commentId),
      body.content
    );
  }

  @UseGuards(ActiveUserGuard, SocialProfileGuard())
  @Delete("comments/:commentId")
  async deleteComment(
    @Param("commentId") commentId: string,
    @CurrentUser() user: User,
    @CurrentProfile() profile: Profile
  ) {
    await this.postCommentService.deleteComment(user,profile, Number(commentId));
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
        parentId: query.parentId ?? null,
      });

    return new PaginatedResponse(records, total, limit, page, {});
  }

  @Get("comments/author/:handle")
  async listCommentsByAuthor(
    @Param("handle") handle: string,
    @Query() query: ListPostCommentsDto
  ) {
    const author = await this.profileRepository.findByHandle(handle);
    if (!author) throw new NotFoundException("Autor nao encontradok");

    const page = query.page ?? 1;
    const limit = query.limit ?? 16;
    const offset = limit * (page - 1);

    const { records, count: total } =
      await this.postCommentRepository.findByUserId(author.id, {
        limit,
        offset,
      });

    return new PaginatedResponse(records, total, limit, page, {});
  }
}
