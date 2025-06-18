import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
} from "@nestjs/common";
import { PoliciesRepository } from "./domain/interfaces/policies-repository";
import { PolicyType } from "./domain/entities/policies";
import { Policy } from "@prisma/client";
import { computeContentHash } from "../shared/utils/hash-utils";

@Controller("policies")
export class PoliciesController {
  constructor(private readonly policiesRepository: PoliciesRepository) {}

  @Get()
  async getPolicies(@Query("type") type: PolicyType): Promise<Policy[]> {
    if (!type) {
      throw new Error("Policy type is required");
    }
    const policies = await this.policiesRepository.getPoliciesByType(type);
    return policies;
  }

  @Post("check-user-agreement")
  async checkUserAgreement(
    @Body() body: { userId: number; type: string }
  ): Promise<{ success: boolean; message: string }> {
    const { userId, type: typeStr } = body;

    if (!userId || !typeStr) {
      throw new BadRequestException("userId and type are required in the body");
    }

    const validTypes = Object.values(PolicyType);
    if (!validTypes.includes(typeStr as PolicyType)) {
      throw new BadRequestException(`Invalid policy type: ${typeStr}`);
    }
    const type = typeStr as PolicyType;

    const latestVersion =
      await this.policiesRepository.getLatestPolicyVersion(type);
    const latestContent =
      await this.policiesRepository.getLatestPolicyContent(type);

    if (!latestVersion || !latestContent) {
      throw new BadRequestException(`No active policy found for type ${type}`);
    }

    const latestHash = computeContentHash(latestContent);

    const userVersion =
      await this.policiesRepository.getUserAgreementVersion(userId);
    const userHash = await this.policiesRepository.getUserAgreementHash(userId);

    if (userVersion !== latestVersion || userHash !== latestHash) {
      return {
        success: false,
        message: "User agreement is not up to date.",
      };
    }

    return { success: true, message: "User agreement is up to date." };
  }

  @Post("accept-user-agreement")
  async acceptUserAgreement(
    @Body()
    body: {
      userId: number;
      type: string;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<{ success: boolean; message: string }> {
    const { userId, type: typeStr, ipAddress, userAgent } = body;

    if (!userId || !typeStr) {
      throw new BadRequestException("userId and type are required in the body");
    }

    const validTypes = Object.values(PolicyType);
    if (!validTypes.includes(typeStr as PolicyType)) {
      throw new BadRequestException(`Invalid policy type: ${typeStr}`);
    }
    const type = typeStr as PolicyType;

    try {
      await this.policiesRepository.acceptUserAgreement(
        userId,
        type,
        ipAddress,
        userAgent
      );
      return { success: true, message: "User agreement updated successfully." };
    } catch (error: any) {
      console.error("Failed to accept user agreement:", error);
      throw new BadRequestException(
        error || "Failed to accept user agreement."
      );
    }
  }
}
