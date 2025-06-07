import { User } from "@/modules/identity/domain/entities/User";
import { Inject, Logger } from "@nestjs/common";
import { PostRepository } from "../domain/interfaces/repositories/post-repository";
import { PostVotesRepository } from "../domain/interfaces/repositories/post-votes-repository";
import { Post, PostStatusEnum, PostTypeEnum } from "../domain/entities/Post";
import { CreatePostDto } from "../presentation/dtos/create-post.dto";
import { PostAuthor } from "../domain/entities/PostAuthor";
import { IncidentsService } from "@/modules/incidents/application/incidents.service";
import { PrismaService } from "@/modules/shared/services/prisma-services";

export class PostServices {
  private readonly logger: Logger = new Logger(PostServices.name);

  constructor(
    @Inject(PostRepository)
    private readonly postRepository: PostRepository,
    private readonly incidentsService: IncidentsService,
    private readonly prismaService: PrismaService,
    private readonly postVotesRepository: PostVotesRepository
  ) {}

  async create(user: User, dto: CreatePostDto) {
    try {
      this.logger.log("Creating post", { dto });

      const author = new PostAuthor({
        id: user.id!,
        name: user.name ?? "Anonimo",
        profilePicture: user?.profilePicture ?? "",
        publicId: user?.publicId,
      });

      const post = new Post({
        id: null,
        type: dto.type,
        isPinned: false,
        isVerified: false,
        title: dto.title,
        content: dto.content,
        publishedAt: new Date(),
        slug: Post.createSlug(user, dto.title),
        status: PostStatusEnum.PUBLISHED,
        attachment: null,
        downVotes: 0,
        upVotes: 0,
        score: 0,
        author,
        coverImageUrl: "",
        medias: [],
      });

      this.logger.log(
        `Storing post to the database: ${JSON.stringify(post, null, 4)}`
      );

      await this.prismaService.openTransaction(
        async (transactionContext: PrismaService) => {
          await this.postRepository.add(post, { transactionContext });

          if (dto.type == PostTypeEnum.INCIDENT) {
            await this.incidentsService.create(user, {
              title: post.title,
              address: dto.address,
              latitude: dto.latitude,
              longitude: dto.longitude,
              description: dto.content,
              incidentDate: dto.incidentDate,
              incidentTypeId: dto.incidentTypeId,
              observation: dto.observation,
              imagePreviewUrl: undefined,
              imageUrl: dto.imageUrl,
            });
          }
        }
      );
      return post;
    } catch (error: unknown) {
      this.logger.error(
        `Error creating post: ${JSON.stringify(error, null, 4)}`,
        { error }
      );
      throw new Error("Failed to create post");
    }
  }

  public async findOne(postSlug: string, user: User) {
    this.logger.log(`Fetching incident with postSlug: ${postSlug}`);
    const post = await this.postRepository.findBySlug(postSlug);

    if (!post) return null;

    const likedByCurrentUser = false;

    /* if (user) {
      likedByCurrentUser = await this.postVotesRepository.exists(
        Number(post.id),
        user.id!
      );
      this.logger.log(
        `User ${user.id} liked post ${post.id}: ${likedByCurrentUser}`
      );
    }
 */
    return {
      ...post,
      likedByCurrentUser,
    };
  }
}
