import { Injectable, BadRequestException } from "@nestjs/common";
import { PostCommentRepository } from "../domain/interfaces/repositories/post-comment-repository";
import { PostComment } from "../domain/entities/PostComment";
import { CurseWordsFilterService } from "../infra/curse-words-filter.service";
import { PostRepository } from "../domain/interfaces/repositories/post-repository";
import { User } from "@/modules/identity/domain/entities/User";
import { CreatePostCommentDto } from "../presentation/dtos/create-post-comment.dto";
import { PartialUserForComment } from "../domain/entities/PostComment";

@Injectable()
export class PostCommentsService {
  constructor(
    private readonly postCommentRepository: PostCommentRepository,
    private readonly postRepository: PostRepository,
    private readonly curseWordsFilter: CurseWordsFilterService
  ) {}


  async addComment(
    postUuid: string,
    body: CreatePostCommentDto,
    user: User
  ): Promise<PostComment> {
    if (CurseWordsFilterService.containsCurseWords(body.content)) {
      throw new BadRequestException("Comentário contém palavras proibidas.");
    }
    const post = await this.postRepository.findByUuid(postUuid, user.id!);
    if (!post?.id) {
      throw new BadRequestException("Post não encontrado");
    }
    const partialUser: PartialUserForComment = {
      id: user.id!,
      publicId: user.publicId,
      name: user.name,
      profilePicture: user.profilePicture,
    };
    const commentEntity = new PostComment({
      id: null,
      postId: post.id,
      userId: user.id!,
      content: body.content,
      user: partialUser,
      parentCommentId: body.parentCommentId ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return this.postCommentRepository.add(commentEntity);
  }

  async updateComment(
    commentId: number,
    content: string,
    user: User
  ): Promise<PostComment> {
    const comment = await this.postCommentRepository.findById(commentId);
    if (!comment) {
      throw new BadRequestException("Comentário não encontrado");
    }
    if (comment.userId !== user.id) {
      throw new BadRequestException("Você não tem permissão para editar este comentário");
    }
    if (CurseWordsFilterService.containsCurseWords(content)) {
      throw new BadRequestException("Comentário contém palavras proibidas.");
    }
    const updatedCommentEntity = new PostComment({
      id: comment.id!,
      postId: comment.postId,
      userId: comment.userId,
      content: content,
      user: comment.user,
      parentCommentId: comment.parentCommentId ?? null,
      createdAt: comment.createdAt,
      updatedAt: new Date(),
    });
    return this.postCommentRepository.update(updatedCommentEntity);
  }

  async deleteComment(commentId: number, user: User): Promise<void> {
    const comment = await this.postCommentRepository.findById(commentId);
    if (!comment) {
      throw new BadRequestException("Comentário não encontrado");
    }
    if (comment.userId !== user.id) {
      throw new BadRequestException("Você não tem permissão para excluir este comentário");
    }
    await this.postCommentRepository.delete(commentId);
  }

}
