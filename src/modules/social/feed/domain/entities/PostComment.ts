import { UserShallow } from "./UserShallow";

export enum CommentType {
  COMMENT = "COMMENT",
  REPLY = "REPLY",
}

export class PostComment {
  public readonly id: number;

  public readonly postId: number;

  public readonly postUuid?: string;

  public content: string;

  public readonly createdAt: Date;

  public readonly updatedAt: Date;

  public readonly user: UserShallow;

  public readonly parentCommentId?: number | null;

  public repliesCount: number = 0;

  public hasReplies: boolean = false;

  constructor(args: {
    id?: number;
    postId: number;
    postUuid?: string;
    content: string;
    user: UserShallow;
    createdAt?: Date;
    updatedAt?: Date;
    parentCommentId?: number | null;
    repliesCount?: number;
  }) {
    this.id = args.id ?? -1;
    this.postId = args.postId;
    this.postUuid = args.postUuid;
    this.content = args.content;
    this.user = args.user;
    this.createdAt = args.createdAt ?? new Date();
    this.updatedAt = args.updatedAt ?? new Date();
    this.parentCommentId = args.parentCommentId ?? null;
    this.repliesCount = args.repliesCount || 0;
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

  public setRepliesCount(count: number) {
    this.repliesCount = count;
    if (this.repliesCount > 0) {
      this.hasReplies = true;
    }
  }

  toJSON() {
    return {
      id: this.id,
      user: this.user,
      type: this.type,
      postId: this.postId,
      postUuid: this.postUuid,
      content: this.content,
      isEdited: this.isEdited,
      createdAt: this.createdAt,
      parentCommentId: this.parentCommentId ?? null,
      hasReplies: this.hasReplies,
      repliesCount: this.repliesCount,
    };
  }
}
