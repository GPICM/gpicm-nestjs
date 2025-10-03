import { UserVerification } from "../../entities/UserVerification";

export abstract class UserVerificationRepository {
  abstract add(user: UserVerification, tx?: unknown): Promise<void>;
  abstract update(user: UserVerification, tx?: unknown): Promise<void>;
  abstract findByToken(token: string): Promise<UserVerification | null>;
}
