import { Module } from "@nestjs/common";
import { IdentityPoliciesModule } from "./policies/policies.module";
import { IdentityAuthModule } from "./auth/identity-auth.module";
import { IdentityCoreModule } from "./core/identity-core.module";

@Module({
  controllers: [],
  providers: [],
  imports: [IdentityCoreModule, IdentityAuthModule, IdentityPoliciesModule],
  exports: [IdentityCoreModule],
})
export class IdentityModule {}
