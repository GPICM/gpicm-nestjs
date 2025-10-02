import { Module } from "@nestjs/common";
import { PrismaProfileRepository } from "@/modules/social/core/infra/repositories/prisma/prisma-profile-repository";
import { ProfileRepository } from "@/modules/social/core/domain/interfaces/repositories/profile-repository";

import { CreateProfileUseCase } from "./application/create-profile.usecase";
import { FindProfileByUserUseCase } from "./application/find-profile-by-user.usecase";

@Module({
  imports: [],
  controllers: [],
  providers: [
    CreateProfileUseCase,
    FindProfileByUserUseCase,
    {
      provide: ProfileRepository,
      useClass: PrismaProfileRepository,
    },
  ],
  exports: [CreateProfileUseCase, FindProfileByUserUseCase],
})
export class ExternalProfileModule {}
