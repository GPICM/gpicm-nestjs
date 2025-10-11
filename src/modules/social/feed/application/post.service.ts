import { User } from "@/modules/identity/core/domain/entities/User";
import { BadRequestException, Inject, Logger } from "@nestjs/common";
import { PostRepository } from "../domain/interfaces/repositories/post-repository";
import { PostVotesRepository } from "../domain/interfaces/repositories/post-votes-repository";
import { PostStatusEnum, PostTypeEnum } from "../domain/entities/Post";
import { CreatePostDto } from "../presentation/dtos/create-post.dto";
import { IncidentsService } from "@/modules/incidents/application/incidents.service";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { ViewerPost } from "../domain/entities/ViewerPost";
import { PostVote, VoteValue } from "../domain/entities/PostVote";
import { UserShallow } from "../domain/entities/UserShallow";
import { PostMediasRepository } from "../domain/interfaces/repositories/post-media-repository";
import { MediaService } from "@/modules/assets/application/media.service";
import { Media } from "@/modules/assets/domain/entities/Media";
import { EventPublisher } from "@/modules/shared/domain/interfaces/events/application-event-publisher";
import { Profile } from "../../core/domain/entities/Profile";
import { PostFactory } from "../domain/factories/PostFactory";
import { PostAttachment } from "../domain/object-values/PostAttchment";
import { RateLimitService } from "@/modules/shared/application/rate-limite-service";
import { PostEvent } from "../../core/domain/interfaces/events";

export class PostServices {
  private readonly logger: Logger = new Logger(PostServices.name);
  private readonly viewsCoolDownMs = 30 * 1000; // 30 secs

  constructor(
    @Inject(PostRepository)
    private readonly postRepository: PostRepository,
    private readonly incidentsService: IncidentsService,
    private readonly prismaService: PrismaService,
    private readonly postMediasRepository: PostMediasRepository,
    private readonly postVotesRepository: PostVotesRepository,
    private readonly mediaService: MediaService,
    private readonly eventPublisher: EventPublisher,
    private readonly rateLimitService: RateLimitService
  ) {}

  async create(user: User, dto: CreatePostDto, profile: Profile) {
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

      await this.eventPublisher.publish(
        new PostEvent("post.created", user.id, post, profile.id)
      );

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

  async incrementViews(postId: number, userId: number) {
    this.logger.log("Increment views from post", { postId, userId });
    const key = `post_view:${userId}:${postId}`;

    await this.rateLimitService.runIfAllowed(
      key,
      this.viewsCoolDownMs,
      async () => {
        this.logger.debug(`Incrementing views for post ${postId}`);
        await this.postRepository.incrementViews(postId);
      }
    );
  }

  async vote(
    user: User,
    profile: Profile,
    postUuid: string,
    voteValue: VoteValue
  ) {
    try {
      const userId = user.id;
      this.logger.log("Voting on post", {
        userId,
        profile,
        postUuid,
        voteValue,
      });

      const post = await this.postRepository.findByUuid(postUuid, userId);
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

      await this.eventPublisher.publish(
        new PostEvent("post.voted", userId, post, profile.id)
      );

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
    user: User,
    profile?: Profile
  ): Promise<ViewerPost | null> {
    const userId = user.id;

    this.logger.log(`Fetching incident with postSlug: ${postSlug}`);
    const post = await this.postRepository.findBySlug(postSlug, user.id);

    if (!post) return null;

    await this.eventPublisher.publish(
      new PostEvent("post.viewed", userId, post, profile?.id)
    );

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
