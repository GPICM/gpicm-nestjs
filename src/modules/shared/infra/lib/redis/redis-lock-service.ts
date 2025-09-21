import { Injectable, Logger } from "@nestjs/common";
import Redlock, { CompatibleRedisClient, Lock } from "redlock";
import { RedisAdapter } from "./redis-adapter";

@Injectable()
export class RedisLockService {
  private readonly logger = new Logger(RedisLockService.name);

  public redlock: Redlock;

  constructor(private readonly redisAdapter: RedisAdapter) {
    this.redlock = new Redlock(
      [this.redisAdapter.getClient() as unknown as CompatibleRedisClient],
      {
        retryCount: 3,
        retryDelay: 200,
        retryJitter: 100,
      }
    );
  }

  async acquireLock(key: string, ttl = 1000): Promise<Lock | null> {
    try {
      const lock = await this.redlock.acquire([key], ttl);
      return lock;
    } catch (error: unknown) {
      this.logger.error("Could not acquire lock", { error });
      return null;
    }
  }
}
