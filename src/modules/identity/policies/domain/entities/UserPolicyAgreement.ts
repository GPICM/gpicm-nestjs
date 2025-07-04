import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";

export class UserPolicyAgreement {
  public userId: number;

  public policyId: string;

  public policyContentHash: string;

  public ipAddress: string;

  public userAgent: string;

  public consentedAt: Date;

  constructor(args: NonFunctionProperties<UserPolicyAgreement>) {
    Object.assign(this, args);
  }
}
