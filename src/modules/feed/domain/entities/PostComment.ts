import { UserShallow } from "./UserShallow";

export enum CommentType {
  COMMENT = "COMMENT",
  REPLY = "REPLY",
}

export class PostComment {
  public readonly id: number | null;

  public readonly postId: number;

  public readonly content: string;

  public readonly createdAt: Date;

  public readonly updatedAt: Date;

  public readonly user: UserShallow;

  public readonly parentCommentId?: number | null;

  constructor(args: {
    id: number | null;
    postId: number;
    content: string;
    user: UserShallow;
    createdAt: Date;
    updatedAt: Date;
    parentCommentId?: number | null;
  }) {
    this.id = args.id ?? null;
    this.postId = args.postId;
    this.content = args.content;
    this.user = args.user;
    this.createdAt = args.createdAt;
    this.updatedAt = args.updatedAt;
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
      content: this.content,
      user: this.user,
      parentCommentId: this.parentCommentId ?? null,
      type: this.type,
      isEdited: this.isEdited,
    };
  }
}
