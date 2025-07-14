import { UserCredential } from "../../../authentication/domain/entities/UserCredential";

export abstract class UserCredentialsRepository {
  abstract add(user: UserCredential, tx?: unknown): Promise<void>;
}
