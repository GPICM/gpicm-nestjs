import { Controller, Get, Post } from "@nestjs/common";
import { PrismaTestRepository } from "./infra/prisma-test.repository";

@Controller("test")
export class TestController {
  constructor(private readonly prismaTestRepository: PrismaTestRepository) {}

  @Get()
  getHello() {
    return this.prismaTestRepository.find(1);
  }

  @Post()
  async createTest() {
    await this.prismaTestRepository.add("teste");
  }
}
