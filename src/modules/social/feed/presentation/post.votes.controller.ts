/* eslint-disable prettier/prettier */
import {
  Controller,
  Logger,
  BadRequestException,
  UseGuards,
  Get,
  Query,
  Param,
  Patch,
} from "@nestjs/common";

import {
  CurrentUser,
  JwtAuthGuard,
} from "@/modules/identity/auth/presentation/meta";
import { User } from "@/modules/identity/core/domain/entities/User";
import { PostRepository } from "../domain/interfaces/repositories/post-repository";
import { PaginatedResponse } from "@/modules/shared/domain/protocols/pagination-response";
import { ListPostQueryDto } from "./dtos/list-post.dtos";
import { PostServices } from "../application/post.service";
import { PostVotesRepository } from "../domain/interfaces/repositories/post-votes-repository";
import { ActiveUserGuard } from "@/modules/identity/auth/presentation/meta/guards/active-user.guard";

@Controller("posts")
@UseGuards(JwtAuthGuard)
export class PostVotesController {
  private readonly logger: Logger = new Logger(PostVotesController.name);

  constructor(
    private readonly postRepository: PostRepository,
    private readonly postVotes: PostVotesRepository,
    private readonly postService: PostServices,
  ) {}

  @Patch(":uuid/vote/up")
  async upVote(@Param("uuid") uuid: string, @CurrentUser() user: User) {
    return this.postService.vote(user, uuid, 1);
  }

  @Patch(":uuid/vote/down")
  async downVote(@Param("uuid") uuid: string, @CurrentUser() user: User) {
    return this.postService.vote(user, uuid, -1);
  }

  @Get(":uuid/votes")
  @UseGuards(ActiveUserGuard)
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
}
