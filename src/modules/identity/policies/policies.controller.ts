import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";

import { PoliciesRepository } from "./domain/interfaces/policies-repository";
import { Policy } from "./domain/entities/Policy";
import { CurrentUser, JwtAuthGuard } from "../presentation/meta";
import { User } from "../domain/entities/User";
import { IpAddress } from "@/modules/shared/decorators/IpAddress";
import { UserAgent } from "@/modules/shared/decorators/UserAgent";
import { UserPolicyAgreement } from "./domain/entities/UserPolicyAgreement";
import { computeContentHash } from "@/modules/shared/utils/hash-utils";
import { UserPolicyAgreementsRepository } from "./domain/interfaces/user-policy-agreements-repository";

@Controller("identity/policies")
export class PoliciesController {
  constructor(
    private readonly policiesRepository: PoliciesRepository,
    private readonly userPolicyAgreementsRepository: UserPolicyAgreementsRepository
  ) {}

  @Get("/latest")
  async getPolicies(): Promise<Policy[]> {
    const policies = await this.policiesRepository.findLatestPolicies();
    return policies;
  }

  @Post("/latest/check-user-agreement")
  @UseGuards(JwtAuthGuard)
  async checkUserAgreements(
    @CurrentUser() user: User
  ): Promise<{ success: boolean; message: string }> {
    const latestPolicies = await this.policiesRepository.findLatestPolicies();

    const userPolicyAgreements =
      await this.userPolicyAgreementsRepository.findLatestAgreementsByUserId(
        user.id!
      );

    if (!userPolicyAgreements.length) {
      return {
        success: false,
        message: "User agreement is not up to date.",
      };
    }

    const userPolicyAgreementMap = {};
    let isUpToDate = true;
    for (const policy of latestPolicies) {
      const agreement = userPolicyAgreements.find(
        (agreement) => (agreement.policyId = policy.id)
      );
      if (agreement) {
        userPolicyAgreementMap[policy.id] = true;
        continue;
      }
      userPolicyAgreementMap[policy.id] = false;
      isUpToDate = false;
    }

    if (!isUpToDate) {
      return {
        success: false,
        message: "User agreement is not up to date.",
      };
    }

    return { success: true, message: "User agreement is up to date." };
  }

  @Post("/:policyId/accept")
  @UseGuards(JwtAuthGuard)
  async acceptUserAgreement(
    @Param("policyId") policyId: string,
    @IpAddress() ipAddress: string,
    @UserAgent() userAgent: string,
    @CurrentUser() user: User
  ): Promise<{ success: boolean; message: string }> {
    const policy = await this.policiesRepository.findById(policyId);

    if (!policy) {
      throw new ForbiddenException();
    }

    try {
      const policyContentHash = computeContentHash(policy.content);

      const agreement = new UserPolicyAgreement({
        ipAddress,
        policyId,
        userAgent,
        userId: user.id!,
        policyContentHash,
        consentedAt: new Date(),
      });

      await this.userPolicyAgreementsRepository.add(agreement);

      return { success: true, message: "User agreement updated successfully." };
    } catch (error: any) {
      console.error("Failed to accept user agreement:", error);

      throw new BadRequestException(
        error || "Failed to accept user agreement."
      );
    }
  }
}
