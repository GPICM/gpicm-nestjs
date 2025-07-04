import { Module } from "@nestjs/common";
import { PoliciesController } from "./policies.controller";
import { PoliciesRepository } from "./domain/interfaces/policies-repository";
import { PrismaPoliciesRepository } from "./infra/repositories/prisma-policies-repository";
import { PrismaService } from "../../shared/services/prisma-services";
import { UserPolicyAgreementsRepository } from "./domain/interfaces/user-policy-agreements-repository";
import { PrismaUserPolicyAgreementsRepository } from "./infra/repositories/prisma-user-policy-agreements-repository";

@Module({
  controllers: [PoliciesController],
  providers: [
    PrismaService,
    {
      provide: PoliciesRepository,
      useClass: PrismaPoliciesRepository,
    },
    {
      provide: UserPolicyAgreementsRepository,
      useClass: PrismaUserPolicyAgreementsRepository,
    },
  ],
  imports: [],
})
export class PoliciesModule {}
