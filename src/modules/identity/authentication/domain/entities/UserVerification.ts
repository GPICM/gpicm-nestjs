import { AuthProviders } from "@/modules/identity/domain/enums/auth-provider";
import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";

export class UserVerification {
  public id: string;

  public email: string;

  public token: string;

  public userId: number;

  public provider: AuthProviders;

  public expiresAt: Date | null;

  constructor(args: NonFunctionProperties<UserVerification>) {
    Object.assign(this, args);
  }
}
