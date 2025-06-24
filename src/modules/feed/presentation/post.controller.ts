/* eslint-disable prettier/prettier */
import {
  Controller,
  Logger,
  Body,
  BadRequestException,
  UseGuards,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UploadedFile,
  Post as PostMethod,
  Get,
  Query,
  Param,
  Patch,
  Post,
  Delete,
} from "@nestjs/common";

import {
  CurrentUser,
  JwtAuthGuard,
} from "@/modules/identity/presentation/meta";
import { FileInterceptor } from "@nestjs/platform-express";
import { CreatePostDto } from "./dtos/create-post.dto";
import { UploadService } from "@/modules/assets/application/upload.service";
import { User } from "@/modules/identity/domain/entities/User";
import { PostRepository } from "../domain/interfaces/repositories/post-repository";
import { PaginatedResponse } from "@/modules/shared/domain/protocols/pagination-response";
import { ListPostQueryDto } from "./dtos/list-post.dtos";
import { PostServices } from "../application/post.service";
import { PostVotesRepository } from "../domain/interfaces/repositories/post-votes-repository";
import { CreatePostCommentDto } from "../presentation/dtos/create-post-comment.dto";
import { UpdateCommentDto } from "../presentation/dtos/update-post-comment.dto";
import { PostCommentRepository } from "../domain/interfaces/repositories/post-comment-repository";
import { ListPostCommentsDto } from "../presentation/dtos/list-post-comments.dto";
import { CreateReplyCommentDto } from "../presentation/dtos/create-reply-comment.dto";
import { CommentType } from "../domain/entities/PostComment";

export const MAX_SIZE_IN_BYTES = 3 * 1024 * 1024; // 3MB

const photoValidation = new ParseFilePipe({ 
  validators: [
    new MaxFileSizeValidator({ maxSize: MAX_SIZE_IN_BYTES }),
    new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
  ],
});

@Controller("posts")
@UseGuards(JwtAuthGuard)
export class PostController {
  private readonly logger: Logger = new Logger(PostController.name);

  constructor(
    private readonly uploadService: UploadService,
    private readonly postRepository: PostRepository,
    private readonly postVotes: PostVotesRepository,
    private readonly postService: PostServices,
    private readonly postCommentRepository: PostCommentRepository // adicionado
  ) {}

  @PostMethod()
  @UseInterceptors(FileInterceptor("photo"))
  async create(
    @Body() body: CreatePostDto,
    @CurrentUser() user: User,
    @UploadedFile(photoValidation) file?: any
  ) {
    try {
      this.logger.log("Starting post creation", { body });

      if (file) {
        this.logger.log("Uploading image", { body });
        body.imageUrl = await this.uploadService.uploadImage(user, file);
      }

      this.logger.log("Creating an post", { body });

      const post = await this.postService.create(user, body);

      this.logger.log("Post successfully created", { post });
      return post;
    } catch (error: unknown) {
      this.logger.error("Error creating post", { error });
      throw new BadRequestException("Failed to create post");
    }
  }

  @Get()
  async list(@Query() query: ListPostQueryDto, @CurrentUser() user: User) {
    this.logger.log("Fetching all posts");


    // TODO: IMPLEMENT GEO LOCATION AND SCORE FILTERS
    const filters = {
      page: query.page,
      limit: query.limit,
      search: query.search,
    };

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 16;
    const offset = limit * (page - 1);

    const { records, count: total } = await this.postRepository.listAll(
      {
        limit,
        offset,
        search: filters.search,
      },
      user.id!
    );

    return new PaginatedResponse(records, total, limit, page, filters);
  }

  @Get("hot")
  async listHot(@Query() query: ListPostQueryDto, @CurrentUser() user: User) {
    this.logger.log("Fetching all posts");

    // TODO: IMPLEMENT GEO LOCATION AND SCORE FILTERS
    const filters = {
      page: query.page,
      limit: query.limit,
      search: query.search,
    };

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 16;
    const offset = limit * (page - 1);

    const { records, count: total } = await this.postRepository.listByRelevance(
      {
        limit,
        offset,
        search: filters.search,
      },
      user.id!
    );

    return new PaginatedResponse(records, total, limit, page, filters);
  }


  @Get(":postSlug")
  getOne(@Param("postSlug") postSlug: string, @CurrentUser() user: User) {
    return this.postService.findOne(postSlug, user);
  }


  @Post(":postSlug/comments")
  async createComment(
    @Param("postSlug") postSlug: string,
    @Body() body: CreatePostCommentDto,
    @CurrentUser() user: User
  ) {
    const post = await this.postRepository.findBySlug(postSlug, user.id!);
    if (!post?.id) {
      throw new BadRequestException("Post não encontrado");
    }

    const comment = await this.postCommentRepository.create({
      postId: post.id,
      userId: user.id!,
      content: body.content,
      user: user,
    });

    return comment;
  }

  @Post(":postSlug/comments/reply")
  async createReply(
    @Param("postSlug") postSlug: string,
    @Body() body: CreateReplyCommentDto,
    @CurrentUser() user: User
  ) {
    const post = await this.postRepository.findBySlug(postSlug, user.id!);
    if (!post?.id) {
      throw new BadRequestException("Post não encontrado");
    }

    const reply = await this.postCommentRepository.createReply({
      ...body,
      postId: post.id,
      userId: user.id!,
      user: user,
      type: CommentType.REPLY,
    });

    return reply;
  }

  @Delete("comments/:commentId")
  async deleteComment(
    @Param("commentId") commentId: string,
    @CurrentUser() user: User
  ) {
    const comment = await this.postCommentRepository.findById(Number(commentId));
    if (!comment) {
      throw new BadRequestException("Comentário não encontrado");
    }
    if (comment.userId !== user.id) {
      throw new BadRequestException("Você não tem permissão para excluir este comentário");
    }
    await this.postCommentRepository.delete(Number(commentId));
    return { message: "Comentário excluído com sucesso" };
  }

  @Patch("comments/:commentId")
  async updateComment(
    @Param("commentId") commentId: string,
    @Body() body: UpdateCommentDto,
    @CurrentUser() user: User
  ) {
    const comment = await this.postCommentRepository.findById(Number(commentId));
    if (!comment) {
      throw new BadRequestException("Comentário não encontrado");}
    if (comment.userId !== user.id) {
      throw new BadRequestException("Você não tem permissão para editar este comentário");
    }
    const updatedComment = await this.postCommentRepository.update(
      Number(commentId),
      {
        content: body.content,
      }
    );
    return updatedComment;
  }

  @Patch(":uuid/vote/up")
  async upVote(
    @Param("uuid") uuid: string,
    @CurrentUser() user: User
  ) {
    return this.postService.vote(user, uuid, 1);
  }

  @Patch(":uuid/vote/down")
  async downVote(
    @Param("uuid") uuid: string,
    @CurrentUser() user: User
  ) {
    return this.postService.vote(user, uuid, -1);
  }

  @Get(":uuid/likes")
  async listPostVotes(
    @Param("uuid") uuid: string,
    @Query() query: ListPostQueryDto,
    @CurrentUser() user: User,
  ) {
    const post = await this.postRepository.findByUuid(uuid, user.id!);

    if (!post?.id) {
      throw new BadRequestException("Post não encontrado");
    }

    const postId = Number(post?.id);

    const filters = {
      page: query.page,
      limit: query.limit,
      search: query.search,
    };

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 16;
    const offset = limit * (page - 1);

    const { records, count: total } = await this.postVotes.listAllByPostId(
      postId,
      {
        limit,
        offset,
        search: filters.search,
      },
    );

    return new PaginatedResponse(records, total, limit, page, filters);
  }

  @Get(":postSlug/comments")
  async listComments(
    @Param("postSlug") postSlug: string,
    @Query() query: ListPostCommentsDto,
    @CurrentUser() user: User
  ) {
    const post = await this.postRepository.findBySlug(postSlug, user.id!);
    if (!post?.id) {
      throw new BadRequestException("Post não encontrado");
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 16;
    const offset = (page - 1) * limit;

    const allComments = await this.postCommentRepository.findByPostId(post.id) ?? [];

    const comments = allComments.filter(c => c.type === CommentType.COMMENT);
    const replies = allComments.filter(c => c.type === CommentType.REPLY && c.parentCommentId);

    const commentMap = new Map<number, any>();
    comments.forEach(comment => {
      commentMap.set(comment.id!, { ...comment.toJSON(), replies: [] });
    });


    replies.forEach(reply => {
      const parent = commentMap.get(reply.parentCommentId!);
      if (parent) {
        parent.replies.push(reply.toJSON());
      }
    });


    const commentsArray = Array.from(commentMap.values());
    const paginated = commentsArray.slice(offset, offset + limit);


    return {
      data: paginated,
      total: commentsArray.length,
      page,
      limit,
    };
  }
}