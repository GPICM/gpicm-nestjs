import { Module } from "@nestjs/common";
import { SocialCoreModule } from "./core/social-core.module";
import { FeedModule } from "./feed/feed.module";
import { SocialGamificationModule } from "./gamification/social-gamification.module";
import { SocialProfileModule } from "./profile/social-profile.module";

@Module({
  imports: [
    FeedModule,
    SocialCoreModule,
    SocialProfileModule,
    SocialGamificationModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class SocialModule {}
