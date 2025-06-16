import { User } from "@/modules/identity/domain/entities/User";
import { BadRequestException, Inject, Logger } from "@nestjs/common";
import { PostRepository } from "../domain/interfaces/repositories/post-repository";
import { PostVotesRepository } from "../domain/interfaces/repositories/post-votes-repository";
import { Post, PostStatusEnum, PostTypeEnum } from "../domain/entities/Post";
import { CreatePostDto } from "../presentation/dtos/create-post.dto";
import { PostAuthor } from "../domain/entities/PostAuthor";
import { IncidentsService } from "@/modules/incidents/application/incidents.service";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { PostAttachment } from "../domain/object-values/PostAttchment";
import { ViewerPost } from "../domain/entities/ViewerPost";
import { PostVote, VoteValue } from "../domain/entities/PostVote";
import { UserShallow } from "../domain/entities/UserShallow";
import { randomUUID } from "crypto";
import { GeoPosition } from "@/modules/shared/domain/object-values/GeoPosition";
import { VoteQueue } from "../domain/interfaces/queues/vote-queue";
import { PostMedia } from "../domain/entities/PostMedia";
import { PostMediasRepository } from "../domain/interfaces/repositories/post-media-repository";

export class PostServices {
  private readonly logger: Logger = new Logger(PostServices.name);

  constructor(
    @Inject(PostRepository)
    private readonly postRepository: PostRepository,
    private readonly incidentsService: IncidentsService,
    private readonly prismaService: PrismaService,
    private readonly postMediasRepository: PostMediasRepository,
    private readonly postVotesRepository: PostVotesRepository,
    @Inject(VoteQueue)
    private voteQueue: VoteQueue
  ) {}

  async create(user: User, dto: CreatePostDto) {
    try {
      this.logger.log("Creating post", { dto });

      // TODO: ADD UNIQUE COLUMNS VALIDATION

      const author = new PostAuthor({
        id: user.id!,
        name: user.name ?? "Anonimo",
        profilePicture: user?.profilePicture ?? "",
        publicId: user?.publicId,
      });

      const postMediasDto = dto.mediaIds.map((mediaId, index) => {
        return PostMedia.Create(mediaId, index);
      });

      const post = new Post({
        id: null,
        author,
        title: dto.title,
        uuid: randomUUID(),
        content: dto.content,
        coverImageUrl: "",
        publishedAt: new Date(),
        status: PostStatusEnum.PUBLISHING,
        slug: Post.createSlug(user, dto.title),
        location: new GeoPosition(dto.latitude, dto.longitude),
        address: dto.address ?? "",
        isVerified: false,
        isPinned: false,
        type: dto.type,
        attachment: null,
        downVotes: 0,
        upVotes: 0,
        score: 0,
        medias: postMediasDto,
      });

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
}
