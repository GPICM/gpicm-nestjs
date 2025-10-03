import { AuthProviders } from "@/modules/identity/core/domain/enums/auth-provider";
import { UserCredential } from "../../entities/UserCredential";

export abstract class UserCredentialsRepository {
  abstract add(user: UserCredential, tx?: unknown): Promise<void>;
  abstract update(user: UserCredential, tx?: unknown): Promise<void>;
  abstract findOne(
    filters: { userId: number; provider: AuthProviders },
    tx?: unknown
  ): Promise<UserCredential | null>;
}
