import { Module } from "@nestjs/common";
import { TestController } from "./test.controller";
import { PrismaTestRepository } from "./infra/prisma-test.repository";

@Module({
  controllers: [TestController],
  providers: [PrismaTestRepository],
  imports: [],
})
export class TestModule {}
