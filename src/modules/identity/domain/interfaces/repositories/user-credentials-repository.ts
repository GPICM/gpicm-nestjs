import { UserCredential } from "../../entities/UserCredential";

export abstract class UserCredentialsRepository {
  abstract add(user: UserCredential, tx?: unknown): Promise<void>;
}
