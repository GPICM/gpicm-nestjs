import { Injectable, OnModuleDestroy, Logger } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisAdapter implements OnModuleDestroy {
  private readonly logger = new Logger(RedisAdapter.name);
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: "redis",
      port: 6379,
    });

    this.redis.on("connect", () => this.logger.log("Redis connected"));
    this.redis.on("error", (err) => this.logger.error("Redis error", err));
  }

  async setKeyWithExpire(
    key: string,
    value: string,
    seconds: number
  ): Promise<"OK" | null> {
    this.logger.log(`Setting key ${key} with expiration ${seconds}s`);
    return this.redis.set(key, value, "EX", seconds);
  }

  async getKeysByPattern(pattern: string): Promise<string[]> {
    this.logger.log(`Getting keys with pattern: ${pattern}`);
    return this.redis.keys(pattern);
  }

  async deleteKey(key: string): Promise<number> {
    this.logger.log(`Deleting key ${key}`);
    return this.redis.del(key);
  }

  async getValue(key: string): Promise<string | null> {
    this.logger.log(`Getting value of key ${key}`);
    return this.redis.get(key);
  }

  async onModuleDestroy() {
    this.logger.log("Disconnecting Redis...");
    await this.redis.quit();
  }
}
