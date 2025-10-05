import { Module } from "@nestjs/common";
import { SocialCoreModule } from "./core/social-core.module";
import { FeedModule } from "./feed/feed.module";
import { SocialGamificationModule } from "./gamification/social-gamification.module";

@Module({
  imports: [SocialCoreModule, FeedModule, SocialGamificationModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class SocialModule {}
