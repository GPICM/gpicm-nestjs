import { Module } from "@nestjs/common";
import { SocialCoreModule } from "./core/social.module";
import { FeedModule } from "./feed/feed.module";

@Module({
  imports: [SocialCoreModule, FeedModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class SocialModule {}
