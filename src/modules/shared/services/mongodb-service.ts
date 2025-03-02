import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";
import { MongoClient, Db } from "mongodb";

@Injectable()
export class MongodbService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MongodbService.name);
  private db: Db;

  constructor(private readonly client: MongoClient) {}

  async onModuleInit() {
    try {
      await this.client.connect();

      this.db = this.client.db(process.env.MONGO_DB_NAME);
      this.logger.log("Connected to MongoDB");
    } catch (error) {
      this.logger.error("Failed to connect to MongoDB", error);
    }
  }

  getDatabase(): Db {
    if (!this.db) {
      throw new Error("Database connection is not established");
    }
    return this.db;
  }

  async onModuleDestroy() {
    await this.client.close();
    this.logger.log("MongoDB connection closed");
  }
}
