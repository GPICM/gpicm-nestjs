import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "../../../../prisma/generated/spy-client";

@Injectable()
export class SpyPrismaReadService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
