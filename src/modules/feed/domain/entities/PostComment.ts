import { UserShallow } from "./UserShallow";

export enum CommentType {
  COMMENT = "COMMENT",
  REPLY = "REPLY",
}

export class PostComment {
  public readonly id: number | null;

  public readonly postId: number;

  public content: string;

  public readonly createdAt: Date;

  public readonly updatedAt: Date;

  public readonly user: UserShallow;

  public readonly parentCommentId?: number | null;

  public hasReplies: boolean = false;

  constructor(args: {
    id: number | null;
    postId: number;
    content: string;
    user: UserShallow;
    createdAt?: Date;
    updatedAt?: Date;
    parentCommentId?: number | null;
  }) {
    this.id = args.id ?? null;
    this.postId = args.postId;
    this.content = args.content;
    this.user = args.user;
    this.createdAt = args.createdAt ?? new Date();
    this.updatedAt = args.updatedAt ?? new Date();
    this.parentCommentId = args.parentCommentId ?? null;
  }

  get type(): CommentType {
    return this.parentCommentId ? CommentType.REPLY : CommentType.COMMENT;
  }

  get isEdited(): boolean {
    return this.updatedAt > this.createdAt;
  }

  public setContent(newContent: string) {
    this.content = newContent;
  }

  public setHasReplies(hasReplies: boolean) {
    this.hasReplies = hasReplies;
  }

  toJSON() {
    return {
      id: this.id,
      user: this.user,
      type: this.type,
      postId: this.postId,
      content: this.content,
      isEdited: this.isEdited,
      createdAt: this.createdAt,
      parentCommentId: this.parentCommentId ?? null,
      hasReplies: this.hasReplies,
    };
  }
}
