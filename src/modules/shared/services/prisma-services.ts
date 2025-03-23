import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  public async connect(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log("Database connected successfully.");
    } catch (error: unknown) {
      this.logger.error("Error connecting to the database", { error });
      throw new Error("Database connection failed");
    }
  }

  public async close(): Promise<void> {
    try {
      await this.$disconnect();
      this.logger.log("Database disconnected successfully.");
    } catch (error: unknown) {
      this.logger.error("Error disconnecting from the database", { error });
      throw new Error("Database disconnection failed");
    }
  }

  public getConnection(): PrismaClient {
    return this;
  }

  public async openTransaction(
    callback: (txContext: PrismaClient) => Promise<unknown>,
    options: { maxWait?: number; timeout?: number } = {
      maxWait: 10000,
      timeout: 40000,
    }
  ): Promise<void> {
    try {
      await this.$transaction(async (tx: PrismaClient) => {
        await callback(tx);
      }, options);
      this.logger.log("Transaction completed successfully.");
    } catch (error: unknown) {
      this.logger.error("Error during transaction", { error });
      throw new Error("Transaction failed");
    }
  }

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.close();
  }
}
