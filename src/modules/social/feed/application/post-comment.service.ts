import { Injectable, BadRequestException, Inject } from "@nestjs/common";

import { PostCommentRepository } from "../domain/interfaces/repositories/post-comment-repository";
import { CreatePostCommentDto } from "../presentation/dtos/create-post-comment.dto";
import { PostRepository } from "../domain/interfaces/repositories/post-repository";
import { CurseWordsFilterService } from "../infra/utils/curse-words-filter.service";
import { ProfileSummary } from "../domain/object-values/ProfileSummary";
import { PostComment } from "../domain/entities/PostComment";
import { Profile } from "../../core/domain/entities/Profile";
import { User } from "@/modules/identity/core/domain/entities/User";
import { UserRoles } from "@/modules/identity/core/domain/enums/user-roles";
import { EventPublisher } from "@/modules/shared/domain/interfaces/events";
import { PostCommentEvent } from "../../core/domain/interfaces/events";

@Injectable()
export class PostCommentsService {
  constructor(
    private readonly postCommentRepository: PostCommentRepository,
    private readonly postRepository: PostRepository,
    @Inject(EventPublisher)
    private readonly eventPublisher: EventPublisher
  ) {}

  async addComment(
    profile: Profile,
    postUuid: string,
    body: CreatePostCommentDto
  ): Promise<void> {
    if (CurseWordsFilterService.containsCurseWords(body.content)) {
      throw new BadRequestException("Comentário contém palavras proibidas.");
    }

    const post = await this.postRepository.findByUuid(
      postUuid,
      profile.id,
      profile.userId
    );
    if (!post?.id) {
      throw new BadRequestException("Post não encontrado");
    }

    const comment = new PostComment({
      postId: post.id,
      content: body.content,
      profile: ProfileSummary.fromProfile(profile),
      parentCommentId: body.parentCommentId ?? null,
    });

    await this.postCommentRepository.add(comment);

    await this.eventPublisher.publish(
      new PostCommentEvent("post-comment.created", comment, profile)
    );
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

    if (comment.profile.id !== profile.id) {
      throw new BadRequestException(
        "Você não tem permissão para editar este comentário"
      );
    }

    if (CurseWordsFilterService.containsCurseWords(content)) {
      throw new BadRequestException("Comentário contém palavras proibidas.");
    }

    comment.setContent(content);
    await this.postCommentRepository.update(comment);

    await this.eventPublisher.publish(
      new PostCommentEvent("post-comment.updated", comment, profile)
    );
  }

  async deleteComment(
    user: User,
    profile: Profile,
    commentId: number
  ): Promise<void> {
    const comment = await this.postCommentRepository.findById(commentId);
    if (!comment) {
      throw new BadRequestException("Comentário não encontrado");
    }

    if (comment.profile.id !== profile.id && user.role !== UserRoles.ADMIN) {
      throw new BadRequestException(
        "Você não tem permissão para excluir este comentário"
      );
    }

    await this.postCommentRepository.delete(commentId);

    await this.eventPublisher.publish(
      new PostCommentEvent("post-comment.removed", comment, profile)
    );
  }
}
