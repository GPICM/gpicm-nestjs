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
  constructor(
    userId: number | null,
    email: string,
    passwordHash: string,
    isPrimary = true
  ) {
    super({
      email,
      userId,
      passwordHash,
      isPrimary: isPrimary,
      provider: AuthProviders.EMAIL_PASSWORD,
      externalId: null,
      lastPasswordChangeAt: null,
      temporaryPasswordExpiresAt: null,
      temporaryPasswordHash: null,
    });
  }

  public static Create(userId: number | null, email: string, password: string) {
    const passwordHash = this.hashPassword(password);

    return new EmailPasswordCredential(userId, email, passwordHash, true);
  }

  private static hashPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

  public verifyPassword(password: string): boolean {
    return bcrypt.compareSync(password, this.passwordHash!);
  }
}
