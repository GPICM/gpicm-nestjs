import { Controller, Get, Param, Logger, Query } from "@nestjs/common";

import { PostRepository } from "../../domain/interfaces/repositories/post-repository";
import { ListPostQueryDto } from "./dtos/list-post.dtos";
import { PaginatedResponse } from "@/modules/shared/domain/protocols/pagination-response";

@Controller("posts")
export class PostController {
  private readonly logger: Logger = new Logger(PostController.name);

  constructor(private readonly postRepository: PostRepository) {}

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
}
