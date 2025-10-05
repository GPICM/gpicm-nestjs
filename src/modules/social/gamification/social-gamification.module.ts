import { Module } from "@nestjs/common";
import { SocialCoreModule } from "../core/social.module";
import { CreateAchievementUseCase } from "./application/create-achievement-usecase";

@Module({
  controllers: [],
  imports: [SocialCoreModule],
  providers: [CreateAchievementUseCase],

  exports: [],
})
export class SocialGamificationModule {}
