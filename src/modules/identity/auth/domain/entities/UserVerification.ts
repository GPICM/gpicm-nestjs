import { AuthProviders } from "@/modules/identity/core/domain/enums/auth-provider";
import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";

export enum UserVerificationType {
  EMAIL_VERIFICATION = "EMAIL_VERIFICATION",
  PASSWORD_RESET = "PASSWORD_RESET",
  EMAIL_CHANGE = "EMAIL_CHANGE",
  MFA = "MFA",
}
export class UserVerification {
  public id: string;

  public type: UserVerificationType;

  public email: string;

  public token: string;

  public userId: number;

  public provider: AuthProviders;

  public expiresAt: Date;

  public verifiedAt: Date | null;

  public used: boolean;

  public attempts: number;

  public ipAddress: string;

  public userAgent: string;

  constructor(args: NonFunctionProperties<UserVerification>) {
    Object.assign(this, args);
  }
}
