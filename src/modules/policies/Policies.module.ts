import { Module } from "@nestjs/common";
import { PoliciesController } from "./Policies.controller";
import { PoliciesRepository } from "./domain/interfaces/policies-repository";
import { PrismaPoliciesRepository } from "./infra/repositories/prisma-policies-repository";
import { PrismaService } from "../shared/services/prisma-services";

@Module({
  controllers: [PoliciesController],
  providers: [
    PrismaService,
    {
      provide: PoliciesRepository,
      useClass: PrismaPoliciesRepository,
    },
  ],
  imports: [],
})
export class PoliciesModule {}
