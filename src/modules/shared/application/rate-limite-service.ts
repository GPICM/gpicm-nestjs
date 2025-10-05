import { Inject, Logger } from "@nestjs/common";
import { RedisAdapter } from "../infra/lib/redis/redis-adapter";

export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);

  constructor(
    @Inject(RedisAdapter)
    private readonly redis: RedisAdapter
  ) {}

  async isRateLimited(key: string, ttlMs: number): Promise<boolean> {
    const lastAction = await this.redis.getValue(key);
    if (!lastAction) return false;

    const elapsed = Date.now() - parseInt(lastAction, 10);
    if (elapsed < ttlMs) {
      this.logger.debug(
        `Rate limit active for ${key} (${ttlMs - elapsed}ms remaining)`
      );
      return true;
    }

    return false;
  }

  async registerAction(key: string, ttlMs: number): Promise<void> {
    await this.redis.setKeyWithExpire(
      key,
      Date.now().toString(),
      Math.ceil(ttlMs / 1000)
    );
  }

  async runIfAllowed<T>(
    key: string,
    ttlMs: number,
    callback: () => Promise<T> | T
  ): Promise<T | null> {
    if (await this.isRateLimited(key, ttlMs)) return null;

    const result = await callback();
    await this.registerAction(key, ttlMs);
    return result;
  }
}
