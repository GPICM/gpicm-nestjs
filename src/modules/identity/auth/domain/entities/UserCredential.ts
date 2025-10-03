import bcrypt from "bcryptjs";

import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { AuthProviders } from "@/modules/identity/core/domain/enums/auth-provider";

export class UserCredential {
  public userId: number;

  public provider: AuthProviders;

  public email: string;

  public isVerified: boolean;

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

  public verifyPassword(password: string): boolean {
    return bcrypt.compareSync(password, this.passwordHash!);
  }

  public static CreateEmailPasswordCredential(
    email: string,
    password: string,
    userId?: number
  ): UserCredential {
    try {
      console.log("Creating new EMAIL_PASSWORD credential", {
        email,
      });

      const salt = bcrypt.genSaltSync(8);
      const passwordHash = bcrypt.hashSync(password, salt);

      const credential = new UserCredential({
        email,
        userId: userId ?? -1,
        passwordHash,
        isPrimary: true,
        isVerified: false,
        provider: AuthProviders.EMAIL_PASSWORD,
        externalId: null,
        lastPasswordChangeAt: null,
        temporaryPasswordExpiresAt: null,
        temporaryPasswordHash: null,
      });

      return credential;
    } catch (error: unknown) {
      console.error("Failed to create credentialsk", {
        error: JSON.stringify(error, null, 4),
      });
      throw error;
    }
  }
}
