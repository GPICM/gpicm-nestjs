import { Injectable } from "@nestjs/common";
import { UserPolicyAgreement } from "../entities/UserPolicyAgreement";

@Injectable()
export abstract class UserPolicyAgreementsRepository {
  abstract add(agreement: UserPolicyAgreement): Promise<void>;

  abstract upsert(agreement: UserPolicyAgreement): Promise<void>;

  abstract findManyByUserIdWithPolicyIds(
    userId: number,
    policyIds: string[]
  ): Promise<UserPolicyAgreement[]>;

  abstract findOneByUserIdWithPolicyId(
    userId: number,
    policyId: string
  ): Promise<UserPolicyAgreement | null>;

  abstract delete(userId: number, policyId: string): Promise<void>;
}
