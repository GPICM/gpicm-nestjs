import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "../../../../prisma/generated/primary-client";

@Injectable()
export class PrimaryPrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
