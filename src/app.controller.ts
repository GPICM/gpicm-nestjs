import { Controller, Get } from "@nestjs/common";
import { SpyPrismaReadService } from "./modules/shared/services/spy-prisma-services";

@Controller()
export class AppController {
  constructor(readonly prisma: SpyPrismaReadService) {}

  @Get()
  async getHello(): Promise<any> {
    const leitura = await this.prisma.leitura.findFirst();
    return leitura;
  }
}
