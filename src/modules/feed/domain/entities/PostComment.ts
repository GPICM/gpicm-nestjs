import { User } from "@/modules/identity/domain/entities/User";

export enum CommentType {
  COMMENT = "COMMENT",
  REPLY = "REPLY",
}

export class PostComment {
  public readonly id: number | null;
  public readonly postId: number;
  public readonly userId: number;
  public readonly content: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly user?: User;
  public readonly parentCommentId?: number | null;

  constructor(args: {
    id?: number | null;
    postId: number;
    userId: number;
    content: string;
    parentCommentId?: number | null;
    parentComment?: PostComment | null;
    parentCommentType?: CommentType;
    createdAt: Date;
    updatedAt: Date;
    user?: User;
    replyTo?: PostComment | null;
  }) {
    this.id = args.id ?? null;
    this.postId = args.postId;
    this.userId = args.userId;
    this.content = args.content;
    this.createdAt = args.createdAt;
    this.updatedAt = args.updatedAt;
    this.user = args.user;
    this.parentCommentId = args.parentCommentId ?? null;
  }

  get type(): CommentType {
    return this.parentCommentId ? CommentType.REPLY : CommentType.COMMENT;
  }

  get isEdited(): boolean {
    return this.updatedAt > this.createdAt;
  }

  toJSON() {
    return {
      id: this.id,
      postId: this.postId,
      userId: this.userId,
      content: this.content,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      user: this.user,
      parentCommentId: this.parentCommentId ?? null,
      type: this.type,
      isEdited: this.isEdited,
    };
  }
}