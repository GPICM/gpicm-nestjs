import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Logger,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";

import { PoliciesRepository } from "./domain/interfaces/policies-repository";
import { Policy } from "./domain/entities/Policy";
import { CurrentUser, JwtAuthGuard } from "../auth/presentation/meta";
import { User } from "../core/domain/entities/User";
import { IpAddress } from "@/modules/shared/decorators/IpAddress";
import { UserAgent } from "@/modules/shared/decorators/UserAgent";
import { UserPolicyAgreement } from "./domain/entities/UserPolicyAgreement";
import {
  computeContentHash,
  isHashEqual,
} from "@/modules/shared/utils/hash-utils";
import { UserPolicyAgreementsRepository } from "./domain/interfaces/user-policy-agreements-repository";

@Controller("identity/policies")
export class PoliciesController {
  private readonly logger = new Logger(PoliciesController.name);
  constructor(
    private readonly policiesRepository: PoliciesRepository,
    private readonly userPolicyAgreementsRepository: UserPolicyAgreementsRepository
  ) {}

  @Get("/latest")
  async getPolicies(): Promise<Policy[]> {
    const policies = await this.policiesRepository.findLatestPolicies();
    return policies;
  }

  @Get("/latest/check-user-agreement")
  @UseGuards(JwtAuthGuard)
  async checkUserAgreements(@CurrentUser() user: User): Promise<{
    success: boolean;
    message: string;
    missingPolicies?: Policy[];
  }> {
    const latestPolicies = await this.policiesRepository.findLatestPolicies();

    if (!latestPolicies.length) {
      return { success: true, message: "User agreement is up to date." };
    }

    const latestPolicyIds = latestPolicies.map((p) => p.id);

    const userAgreements =
      await this.userPolicyAgreementsRepository.findManyByUserIdWithPolicyIds(
        user.id,
        latestPolicyIds
      );

    const acceptedPolicyIds = new Set(userAgreements.map((a) => a.policyId));

    const missingPolicies = latestPolicies.filter(
      (policy) => !acceptedPolicyIds.has(policy.id)
    );

    if (missingPolicies.length > 0) {
      return {
        success: false,
        message: "User agreement is not up to date.",
        missingPolicies,
      };
    }

    return {
      success: true,
      message: "User agreement is up to date.",
    };
  }

  @Post("/:policyId/accept")
  @UseGuards(JwtAuthGuard)
  async acceptUserAgreement(
    @Param("policyId") policyId: string,
    @IpAddress() ipAddress: string,
    @UserAgent() userAgent: string,
    @CurrentUser() user: User
  ): Promise<{ success: boolean; message: string }> {
    try {
      const userId = user.id;

      this.logger.log("Accepting policy", { policyId, userId });

      const policy = await this.policiesRepository.findById(policyId);
      if (!policy) {
        this.logger.error("Policy not found", { policyId, userId });
        throw new ForbiddenException();
      }

      const policyContentHash = computeContentHash(policy.content);

      this.logger.error("Looking for users agreement", { policyId, userId });
      const agreement =
        await this.userPolicyAgreementsRepository.findOneByUserIdWithPolicyId(
          userId,
          policy.id
        );

      this.logger.error("Agreement Result", { agreement });

      if (agreement) {
        this.logger.log("There is already a agreement to this policy");

        if (isHashEqual(policyContentHash, agreement.policyContentHash)) {
          this.logger.log("With the same content hash");

          return { success: true, message: "User agreement is up to date." };
        }

        this.logger.log("Content has changed");
      }

      const newAgreement = new UserPolicyAgreement({
        ipAddress,
        policyId,
        userAgent,
        userId: user.id,
        policyContentHash,
        consentedAt: new Date(),
      });

      await this.userPolicyAgreementsRepository.upsert(newAgreement);

      return { success: true, message: "User agreement updated successfully." };
    } catch (error: any) {
      console.error("Failed to accept user agreement:", error);

      throw new BadRequestException(
        error || "Failed to accept user agreement."
      );
    }
  }
}
