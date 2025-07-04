import { Injectable } from "@nestjs/common";
import { UserPolicyAgreement } from "../entities/UserPolicyAgreement";

@Injectable()
export abstract class UserPolicyAgreementsRepository {
  abstract add(agreement: UserPolicyAgreement): Promise<void>;

  abstract findManyByUserIdWithPolicyIds(
    userId: number,
    policyIds: string[]
  ): Promise<UserPolicyAgreement[]>;
}
