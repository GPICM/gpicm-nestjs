import { Injectable } from "@nestjs/common";
import { Policies, PolicyType } from "../entities/policies";

@Injectable()
export abstract class PoliciesRepository {
  abstract getPoliciesByType(type: PolicyType): Promise<Policies[]>;
  abstract getUserAgreementVersion(userId: number): Promise<string | null>;
  abstract getUserAgreementHash(userId: number): Promise<string | null>;
  abstract getLatestPolicyVersion(type: PolicyType): Promise<string | null>;
  abstract getLatestPolicyContent(type: PolicyType): Promise<string | null>;
  abstract acceptUserAgreement(
    userId: number,
    type: PolicyType,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void>;
}
