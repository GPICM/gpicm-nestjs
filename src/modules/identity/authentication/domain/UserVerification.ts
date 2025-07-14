import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";

export class UserVerification {
  public id: string;
  public email: string;
  public token: string;
  public userId: number;
  public expiresAt: Date | null;
  public createdAt: Date | null;

  constructor(args: NonFunctionProperties<UserVerification>) {
    Object.assign(this, args);
  }
}
