import { UserCredential } from "../../../authentication/domain/entities/UserCredential";
import { AuthProviders } from "../../enums/auth-provider";

export abstract class UserCredentialsRepository {
  abstract add(user: UserCredential, tx?: unknown): Promise<void>;
  abstract update(user: UserCredential, tx?: unknown): Promise<void>;
  abstract findOne(
    filters: { userId: number; provider: AuthProviders },
    tx?: unknown
  ): Promise<void>;
}
