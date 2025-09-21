import { Queue } from "bullmq";
import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";

import {
  SocialProfileEvent,
  SocialProfileEventsQueueDto,
  SocialProfileEventsQueuePublisher,
  SOCIAL_PROFILE_EVENTS_QUEUE_NAME,
} from "../../domain/queues/social-profile-events-queue";
import { BullQueuePublisher } from "@/modules/shared/infra/bull-queue-publisher";

@Injectable()
export class BullSocialProfileQueuePublisher
  extends BullQueuePublisher<SocialProfileEvent, SocialProfileEventsQueueDto>
  implements SocialProfileEventsQueuePublisher
{
  constructor(@InjectQueue(SOCIAL_PROFILE_EVENTS_QUEUE_NAME) queue: Queue) {
    super(queue);
  }
}
