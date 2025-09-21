import { Inject, Injectable, Logger } from "@nestjs/common";
import { SocialProfileEventsQueuePublisher } from "../../domain/queues/social-profile-events-queue";
import { EventSubscriber } from "@/modules/shared/domain/interfaces/events";
import { PostCreatedEvent } from "../../domain/interfaces/events";

@Injectable()
export class PubSubToBullSubscriber {
  private readonly logger = new Logger(PubSubToBullSubscriber.name);

  constructor(
    private readonly eventSubscriber: EventSubscriber,
    @Inject(SocialProfileEventsQueuePublisher)
    private readonly profileQueue: SocialProfileEventsQueuePublisher
  ) {
    void this.subscribeToEvents();
  }

  private async subscribeToEvents() {
    const events = ["post.created"];

    await this.eventSubscriber.subscribe<PostCreatedEvent>(
      events[0],
      (event: PostCreatedEvent) => {
        this.logger.log(`Received event, pushing to BullMQ`, { event });
        try {
          void this.profileQueue.publish({
            event: "post",
            data: { profileId: event.data.profileId },
          });
        } catch (error: unknown) {
          this.logger.error(`Failed to enqueue job for`, { error });
        }
      }
    );
  }
}
