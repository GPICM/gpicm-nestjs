import { Injectable } from "@nestjs/common";
import { Policy } from "../entities/Policy";
import { UserPolicyAgreement } from "../entities/UserPolicyAgreement";

@Injectable()
export abstract class UserPolicyAgreementsRepository {
  abstract add(agreement: UserPolicyAgreement): Promise<Policy>;

  abstract findLatestAgreementsByUserId(
    userId: number
  ): Promise<UserPolicyAgreement[]>;
}
