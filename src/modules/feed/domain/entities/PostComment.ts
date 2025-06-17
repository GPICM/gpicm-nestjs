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
  public readonly type: CommentType;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly user?: User; 

  constructor(args: {
    id?: number | null;
    postId: number;
    userId: number;
    content: string;
    type: CommentType;
    createdAt: Date;
    updatedAt: Date;
    user?: User;
  }) {
    this.id = args.id ?? null;
    this.postId = args.postId;
    this.userId = args.userId;
    this.content = args.content;
    this.type = args.type;
    this.createdAt = args.createdAt;
    this.updatedAt = args.updatedAt;
    this.user = args.user;
  }
}
