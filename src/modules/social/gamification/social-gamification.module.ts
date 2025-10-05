import { Module } from "@nestjs/common";
import { SocialCoreModule } from "../core/social.module";
import { CreateAchievementUseCase } from "./application/create-achievement-usecase";
import { SocialGamificationController } from "./presentation/social-gamification.controller";

@Module({
  controllers: [SocialGamificationController],
  imports: [SocialCoreModule],
  providers: [CreateAchievementUseCase],

  exports: [],
})
export class SocialGamificationModule {}
