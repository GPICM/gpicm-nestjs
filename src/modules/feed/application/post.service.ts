import { User } from "@/modules/identity/domain/entities/User";
import { BadRequestException, Inject, Logger } from "@nestjs/common";
import { PostRepository } from "../domain/interfaces/repositories/post-repository";
import { PostVotesRepository } from "../domain/interfaces/repositories/post-votes-repository";
import { PostStatusEnum, PostTypeEnum } from "../domain/entities/Post";
import { CreatePostDto } from "../presentation/dtos/create-post.dto";
import { IncidentsService } from "@/modules/incidents/application/incidents.service";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { PostAttachment } from "../domain/object-values/PostAttchment";
import { ViewerPost } from "../domain/entities/ViewerPost";
import { PostVote, VoteValue } from "../domain/entities/PostVote";
import { UserShallow } from "../domain/entities/UserShallow";
import { VoteQueue } from "../domain/interfaces/queues/vote-queue";
import { PostMediasRepository } from "../domain/interfaces/repositories/post-media-repository";
import { MediaService } from "@/modules/assets/application/media.service";
import { Media } from "@/modules/assets/domain/entities/Media";
import { PostFactory } from "../domain/factories/PostFactory";
import { RedisAdapter } from "@/modules/shared/infra/lib/redis/redis-adapter";
import { ProfileService } from "@/modules/identity/application/profile.service";
export class PostServices {
  private readonly logger: Logger = new Logger(PostServices.name);
  private readonly viewCooldownMs = 30 * 1000; // 30 secs

  constructor(
    @Inject(PostRepository)
    private readonly postRepository: PostRepository,
    private readonly incidentsService: IncidentsService,
    private readonly prismaService: PrismaService,
    private readonly postMediasRepository: PostMediasRepository,
    private readonly postVotesRepository: PostVotesRepository,
    private readonly mediaService: MediaService,
    private readonly redisAdapter: RedisAdapter,
    private readonly profileService: ProfileService,
    @Inject(VoteQueue)
    private voteQueue: VoteQueue
  ) {}

  async create(user: User, dto: CreatePostDto) {
    try {
      this.logger.log("Creating post", { dto });

      const medias = await this.validateMedias(user, dto.mediaIds);

      const post = PostFactory.createPost(user, dto, medias);

      this.logger.log(
        `Storing post to the database: ${JSON.stringify(post, null, 4)}`
      );

      await this.prismaService.openTransaction(
        async (transactionContext: PrismaService) => {
          if (dto.type == PostTypeEnum.INCIDENT) {
            const incident = await this.incidentsService.create(user, {
              title: post.title,
              address: dto.address,
              latitude: dto.latitude,
              longitude: dto.longitude,
              description: dto.content,
              incidentDate: dto.incidentDate,
              incidentTypeId: dto.incidentTypeId,
              observation: dto.observation,
              imagePreviewUrl: undefined,
              imageUrl: "",
            });

            post.setAttachment(
              new PostAttachment(incident.id, incident, "Incident")
            );

            post.setTags([incident.incidentType.slug]);

            post.setStatus(PostStatusEnum.PUBLISHED);
          }

          const postId = await this.postRepository.add(post, {
            transactionContext,
          });

          post.setId(postId);
          const postMedias = post.getMedias();

          if (postMedias) {
            await this.postMediasRepository.bulkAdd(postMedias, {
              transactionContext,
            });
          }
        }
      );
      await this.profileService.refreshPostCount(user.id);
      this.logger.log("post created successfully", { post });
      return post;
    } catch (error: unknown) {
      this.logger.error(
        `Error creating post: ${JSON.stringify(error, null, 4)}`,
        { error }
      );
      throw new Error("Failed to create post");
    }
  }

  async incrementViews(post: ViewerPost, user: User) {
    const postViewKey = `post_view:${user.id}:${post.id}`;
    const now = Date.now();

    try {
      const lastViewTimestampStr =
        await this.redisAdapter.getValue(postViewKey);

      if (lastViewTimestampStr) {
        const lastViewTime = parseInt(lastViewTimestampStr, 10);

        if (now - lastViewTime < this.viewCooldownMs) {
          this.logger.log(
            `Pulando o incremento de visualização para o post ID: ${post.id} pelo usuário ID: ${user.id} devido ao cooldown.`
          );
          return;
        }
      }

      this.logger.log(
        `Incrementando visualização para o post ID: ${post.id}, Título: ${post.title}`
      );
      await this.postRepository.incrementViews(post);

      const cooldownSeconds = Math.ceil(this.viewCooldownMs / 1000);

      await this.redisAdapter.setKeyWithExpire(
        postViewKey,
        now.toString(),
        cooldownSeconds
      );
    } catch (error: unknown) {
      this.logger.error(
        `Error incrementing post view: ${JSON.stringify(error, null, 4)}`,
        { error }
      );
    }
  }

  async vote(user: User, postUuid: string, voteValue: VoteValue) {
    try {
      const userId = user.id;
      this.logger.log("Creating post", { userId, postUuid, voteValue });

      const post = await this.postRepository.findByUuid(postUuid, user.id);
      if (!post) {
        throw new BadRequestException("Post not found");
      }

      const postId = post.id!;
      const updatedVote = post.toggleVote(voteValue);

      await this.prismaService.openTransaction(async (transactionContext) => {
        if (updatedVote === VoteValue.NULL) {
          await this.postVotesRepository.delete(userId, post.id!, {
            transactionContext,
          });
          return;
        }

        await this.postVotesRepository.upsert(
          new PostVote({
            postId,
            value: updatedVote,
            user: UserShallow.fromUser(user),
          }),
          { transactionContext }
        );
      });

      await this.voteQueue.addVoteJob({ postId: postId });

      this.logger.log(
        `Storing post to the database: ${JSON.stringify(post, null, 4)}`
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

  public async findOne(
    postSlug: string,
    user: User
  ): Promise<ViewerPost | null> {
    this.logger.log(`Fetching incident with postSlug: ${postSlug}`);
    const post = await this.postRepository.findBySlug(postSlug, user.id);

    if (!post) return null;

    return post;
  }

  public async findOneByUuid(
    postUuid: string,
    user: User
  ): Promise<ViewerPost | null> {
    this.logger.log(`Fetching incident with postUuid: ${postUuid}`);
    const post = await this.postRepository.findByUuid(postUuid, user.id);

    if (!post) return null;

    return post;
  }

  private async validateMedias(
    user: User,
    mediaIds: string[]
  ): Promise<Media[]> {
    try {
      const medias = await this.mediaService.findManyByIds(user, mediaIds);
      if (!mediaIds.length) {
        return [];
      }

      return medias;
    } catch (error: unknown) {
      this.logger.error("Missing medias", { error });
      throw new BadRequestException("Missing Media");
    }
  }
}
