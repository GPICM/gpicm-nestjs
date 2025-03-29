import { Controller, Get, Param, Logger } from "@nestjs/common";

import { PostRepository } from "../../domain/interfaces/repositories/post-repository";

@Controller("posts")
export class PostController {
  private readonly logger: Logger = new Logger(PostController.name);

  constructor(private readonly postRepository: PostRepository) {}

  @Get()
  async list() {
    this.logger.log("Fetching all posts");
    return await this.postRepository.listAll();
  }

  @Get(":postSlug")
  async getOne(@Param("postSlug") postSlug: string) {
    this.logger.log(`Fetching incident with postSlug: ${postSlug}`);
    return await this.postRepository.findBySlug(postSlug);
  }
}
