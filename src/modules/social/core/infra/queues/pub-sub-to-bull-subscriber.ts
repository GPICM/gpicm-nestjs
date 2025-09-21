import { Inject, Injectable, Logger } from "@nestjs/common";
import { SocialProfileEventsQueuePublisher } from "../../domain/queues/social-profile-events-queue";
import { EventSubscriber } from "@/modules/shared/domain/interfaces/events";
import {
  PostActionEvent,
  ProfileFollowingEvent,
} from "../../domain/interfaces/events";

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
    // Create a single handler function
    const postHandler = (event: PostActionEvent) => {
      void this.profileQueue.publish({
        event: event.event,
        data: { profileId: event.data.profileId },
      });
    };

    const profileHandler = (event: ProfileFollowingEvent) => {
      void this.profileQueue.publish({
        event: event.event,
        data: {
          profileId: event.data.profileId,
          targetProfileId: event.data.targetProfileId,
        },
      });
    };

    await this.eventSubscriber.subscribeMany({
      "post.created": postHandler,
      "post.commented": postHandler,
      "post.uncommented": postHandler,
      "profile.followed": profileHandler,
      "profile.unfollowed": profileHandler,
    });
  }
}
