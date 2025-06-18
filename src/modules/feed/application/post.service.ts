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
import { Media, MediaTypeEnum } from "@/modules/assets/domain/entities/Media";
import { PostFactory } from "../domain/factories/PostFactory";

export class PostServices {
  private readonly logger: Logger = new Logger(PostServices.name);

  constructor(
    @Inject(PostRepository)
    private readonly postRepository: PostRepository,
    private readonly incidentsService: IncidentsService,
    private readonly prismaService: PrismaService,
    private readonly postMediasRepository: PostMediasRepository,
    private readonly postVotesRepository: PostVotesRepository,
    private readonly mediaService: MediaService,
    @Inject(VoteQueue)
    private voteQueue: VoteQueue
  ) {}

  async create(user: User, dto: CreatePostDto) {
    try {
      this.logger.log("Creating post", { dto });

      const medias = await this.validateMedias(user, dto.mediaIds);

      let coverImageMedia: Media | null = null;
      if (medias.length) {
        coverImageMedia = this.getCoverImage(user, medias);
      }

      const post = PostFactory.createPost(user, dto, coverImageMedia);

      this.logger.log(
        `Storing post to the database: ${JSON.stringify(post, null, 4)}`
      );

      await this.prismaService.openTransaction(
        async (transactionContext: PrismaService) => {
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
            post.setStatus(PostStatusEnum.PUBLISHED);

            await this.postRepository.update(post, { transactionContext });
          }
        }
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

  async vote(user: User, postUuid: string, voteValue: VoteValue) {
    try {
      const userId = user.id!;
      this.logger.log("Creating post", { userId, postUuid, voteValue });

      const post = await this.postRepository.findByUuid(postUuid, user.id!);
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
    const post = await this.postRepository.findBySlug(postSlug, user.id!);

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

  private getCoverImage(user: User, medias: Media[]): Media | null {
    try {
      this.logger.log("Searching for a cover image");
      let coverImageMedia: Media | null = null;

      for (const media of medias) {
        if (media.type === MediaTypeEnum.IMAGE) {
          coverImageMedia = media;
        }
      }

      return coverImageMedia;
    } catch (error: unknown) {
      this.logger.error("Missing medias", { error });
      throw new BadRequestException("Missing Media");
    }
  }
}
