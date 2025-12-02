import { Logger, Controller } from "@nestjs/common";
import {
  Ctx,
  EventPattern,
  Payload,
  RedisContext,
} from "@nestjs/microservices";
import { AchievementEngine } from "../application/achievement.engine";
import { PostEvent } from "../../core/domain/interfaces/events";
import { RedisLockService } from "@/modules/shared/infra/lib/redis/redis-lock-service";

@Controller()
export class SocialGamificationAsyncController {
  private readonly logger = new Logger(SocialGamificationAsyncController.name);

  constructor(
    private readonly achievementEngine: AchievementEngine,
    private readonly redisLockService: RedisLockService
  ) {}

  @EventPattern("post.*")
  async handlePost(@Payload() event: PostEvent, @Ctx() context: RedisContext) {
    this.logger.log(`Received event: ${context.getChannel()}}`, { event });

    const profileId = event.data.profileId;
    if (!profileId) {
      this.logger.warn("Event does not have a profileId", { event });
      return;
    }

    const lockKey = `achievement-lock:${profileId}`;
    const lockTTL = 1000; // 5 seconds, adjust based on expected execution time

    const lock = await this.redisLockService.acquireLock(lockKey, lockTTL);
    if (!lock) {
      this.logger.warn(
        `Could not acquire lock for profileId: ${profileId}, skipping processing`
      );
      return;
    }

    this.logger.log(
      `Processing achievements for profileId: ${event.data.profileId}`
    );

    try {
      this.logger.log(`Processing achievements for profileId: ${profileId}`);
      const granted = await this.achievementEngine.execute(profileId);

      if (granted) {
        this.logger.log(
          `Achievements granted to profileId: ${event.data.profileId}`
        );
      } else {
        this.logger.log(
          `No achievements eligible for profileId: ${event.data.profileId}`
        );
      }
    } catch (error: unknown) {
      this.logger.error(
        `Failed to process achievements for profileId: ${profileId}`,
        { error }
      );
    } finally {
      await this.redisLockService.releaseLock(lock);
      this.logger.log(`Released lock for profileId: ${profileId}`);
    }

    // TODO: send email
    this.logger.debug("Email sending not implemented yet");
  }
}
