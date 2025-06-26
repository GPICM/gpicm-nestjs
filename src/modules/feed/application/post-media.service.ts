import { User } from "@/modules/identity/domain/entities/User";
import { Inject, Logger } from "@nestjs/common";
import { PostRepository } from "../domain/interfaces/repositories/post-repository";
import { PostMediasRepository } from "../domain/interfaces/repositories/post-media-repository";
import { PostMedia } from "../domain/entities/PostMedia";

export class PostMediaService {
  private readonly logger: Logger = new Logger(PostMediaService.name);

  constructor(
    @Inject(PostRepository)
    private readonly postRepository: PostRepository,
    private readonly postMediasRepository: PostMediasRepository
  ) {}

  public async listMediasByPostUuid(
    user: User,
    uuid: string
  ): Promise<PostMedia[]> {
    this.logger.log(`Fetching post medias by post Uuid: ${uuid}`);
    const post = await this.postRepository.findByUuid(uuid, user.id!);
    if (!post) return [];

    const medias = await this.postMediasRepository.findManyByPostId(post.id!);

    return medias;
  }
}
