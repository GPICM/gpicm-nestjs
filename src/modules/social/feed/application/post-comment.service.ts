import { Injectable, BadRequestException, Inject } from "@nestjs/common";

import { User } from "@/modules/identity/domain/entities/User";

import { PostCommentRepository } from "../domain/interfaces/repositories/post-comment-repository";
import { CreatePostCommentDto } from "../presentation/dtos/create-post-comment.dto";
import { PostRepository } from "../domain/interfaces/repositories/post-repository";
import { CurseWordsFilterService } from "./curse-words-filter.service";
import { UserShallow } from "../domain/entities/UserShallow";
import { PostComment } from "../domain/entities/PostComment";
import { CommentsQueue } from "../domain/interfaces/queues/comments-queue";
import { SocialProfileEventsQueuePublisher } from "../../core/domain/queues/social-profile-events-queue";
import { Profile } from "../../core/domain/entities/Profile";

@Injectable()
export class PostCommentsService {
  constructor(
    private readonly postCommentRepository: PostCommentRepository,
    private readonly postRepository: PostRepository,
    private readonly commentsQueue: CommentsQueue,
    @Inject(SocialProfileEventsQueuePublisher)
    private readonly eventsQueuePublisher: SocialProfileEventsQueuePublisher
  ) {}

  async addComment(
    profile: Profile,
    postUuid: string,
    body: CreatePostCommentDto,

    // TODO: REMOVE LATTER
    user: User
  ): Promise<void> {
    if (CurseWordsFilterService.containsCurseWords(body.content)) {
      throw new BadRequestException("Comentário contém palavras proibidas.");
    }

    const post = await this.postRepository.findByUuid(postUuid, user.id);
    if (!post?.id) {
      throw new BadRequestException("Post não encontrado");
    }

    const comment = new PostComment({
      postId: post.id,
      content: body.content,
      // TODO: USER PROFILE IN THE FUTURE
      user: UserShallow.fromUser(user),
      parentCommentId: body.parentCommentId ?? null,
    });

    await this.postCommentRepository.add(comment);

    // TODO ADD A PUB AND SUB BEFORE
    await this.eventsQueuePublisher.publish({
      event: "comment",
      data: { profileId: profile.id },
    });

    await this.commentsQueue.addCommentJob({
      postId: post.id,
      commentParentId: body.parentCommentId,
    });
  }

  async updateComment(
    profile: Profile,
    commentId: number,
    content: string
  ): Promise<void> {
    const comment = await this.postCommentRepository.findById(commentId);
    if (!comment) {
      throw new BadRequestException("Comentário não encontrado");
    }

    if (comment.user.id !== profile.userId) {
      throw new BadRequestException(
        "Você não tem permissão para editar este comentário"
      );
    }

    if (CurseWordsFilterService.containsCurseWords(content)) {
      throw new BadRequestException("Comentário contém palavras proibidas.");
    }

    comment.setContent(content);

    return this.postCommentRepository.update(comment);
  }

  async deleteComment(profile: Profile, commentId: number): Promise<void> {
    const comment = await this.postCommentRepository.findById(commentId);
    if (!comment) {
      throw new BadRequestException("Comentário não encontrado");
    }

    if (comment.user.id !== profile.userId) {
      throw new BadRequestException(
        "Você não tem permissão para excluir este comentário"
      );
    }

    await this.postCommentRepository.delete(commentId);

    await this.commentsQueue.addCommentJob({
      postId: comment.postId,
      commentParentId: comment.parentCommentId || undefined,
    });

    await this.eventsQueuePublisher.publish({
      event: "uncomment",
      data: { profileId: profile.id },
    });
  }
}
