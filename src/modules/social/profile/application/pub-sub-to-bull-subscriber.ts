import { Inject, Injectable } from "@nestjs/common";
import { SocialProfileEventsQueuePublisher } from "../../core/domain/queues/social-profile-events-queue";
import { EventSubscriber } from "@/modules/shared/domain/interfaces/events";
import {
  PostActionEvent,
  ProfileFollowingEvent,
} from "../../core/domain/interfaces/events";

@Injectable()
export class PubSubToBullSubscriber {
  constructor(
    private readonly eventSubscriber: EventSubscriber,
    @Inject(SocialProfileEventsQueuePublisher)
    private readonly profileQueue: SocialProfileEventsQueuePublisher
  ) {
    void this.subscribeToEvents();
  }

  private postHandler = (event: PostActionEvent) => {
    void this.profileQueue.add({
      event: event.event,
      data: { profileId: event.data.profileId },
    });
  };

  private profileHandler = (event: ProfileFollowingEvent) => {
    void this.profileQueue.add({
      event: event.event,
      data: {
        profileId: event.data.profileId,
        targetProfileId: event.data.targetProfileId,
      },
    });
  };

  private async subscribeToEvents() {
    await this.eventSubscriber.subscribeMany({
      "post.created": this.postHandler,
      "post.commented": this.postHandler,
      "post.uncommented": this.postHandler,
      "profile.followed": this.profileHandler,
      "profile.unfollowed": this.profileHandler,
    });
  }
}
