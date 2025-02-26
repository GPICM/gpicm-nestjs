import { Global, Module } from "@nestjs/common";
import { PrimaryPrismaService } from "./services/prisma-services";
import { SpyPrismaReadService } from "./services/spy-prisma-services";

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [PrimaryPrismaService, SpyPrismaReadService],
  exports: [PrimaryPrismaService, SpyPrismaReadService],
})
export class SharedModule {}
