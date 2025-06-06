import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { AuthorSummary } from "../object-values/AuthorSumary";
import { IncidentType } from "./IncidentType";
import {
  Post,
  PostStatusEnum,
  PostTypeEnum,
} from "@/modules/feed/domain/entities/Post";

import { PostAttachment } from "@/modules/feed/domain/object-values/PostAttchment";

export enum IncidentStatus {
  PENDING = 1,
  IN_PROGRESS = 2,
  COMPLETED = 3,
  CANCELED = 4,
}

export class Incident {
  id: string;

  title: string;

  description: string;

  status: number;

  imageUrl: string | null;

  address: string;

  latitude: number | null;

  longitude: number | null;

  incidentDate: Date;

  imagePreviewUrl: string | null;

  reporterName: string | null;

  observation: string | null;

  author: AuthorSummary;

  incidentType: IncidentType;

  constructor(args: NonFunctionProperties<Incident>) {
    Object.assign(this, args);
  }

  public publish() {
    return new Post({
      id: null,
      title: this.title,
      content: this.description,
      type: PostTypeEnum.INCIDENT,
      status: PostStatusEnum.PUBLISHED,
      slug: Post.createSlug(this.title),
      publishedAt: new Date(),
      author: this.author,
      attachment: new PostAttachment(this.id, this),
      downVotes: 0,
      score: 0,
      upVotes: 0,
      isPinned: false,
      isVerified: false,
    });
  }
}
