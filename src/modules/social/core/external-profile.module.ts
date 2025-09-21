import { Module } from "@nestjs/common";
import { PrismaProfileRepository } from "@/modules/social/core/infra/repositories/prisma/prisma-profile-repository";
import { ProfileRepository } from "@/modules/social/core/domain/interfaces/repositories/profile-repository";

import { CreateProfileUseCase } from "./application/create-profile.usecase";

@Module({
  imports: [],
  controllers: [],
  providers: [
    CreateProfileUseCase,
    {
      provide: ProfileRepository,
      useClass: PrismaProfileRepository,
    },
  ],
  exports: [CreateProfileUseCase],
})
export class ExternalProfileModule {}
