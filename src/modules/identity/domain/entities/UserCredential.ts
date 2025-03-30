import bcrypt from "bcrypt";

import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { AuthProviders } from "@/modules/identity/domain/enums/auth-provider";

export class UserCredential {
  public userId: number | null;

  public provider: AuthProviders;

  public email: string;

  public externalId: string | null;

  public passwordHash: string | null;

  public temporaryPasswordHash: string | null;

  public temporaryPasswordExpiresAt: Date | null;

  public lastPasswordChangeAt: Date | null;

  public isPrimary: boolean;

  constructor(args: NonFunctionProperties<UserCredential>) {
    Object.assign(this, args);
  }

  public setUserId(newUserId: number) {
    this.userId = newUserId;
  }
}

export class EmailPasswordCredential extends UserCredential {
  constructor(userId: number | null, email: string, password: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const passwordHash: string = bcrypt.hashSync(password, 10);
    super({
      userId,
      email,
      passwordHash,
      provider: AuthProviders.EMAIL_PASSWORD,
      isPrimary: true,
      externalId: null,
      lastPasswordChangeAt: null,
      temporaryPasswordExpiresAt: null,
      temporaryPasswordHash: null,
    });
  }
}
