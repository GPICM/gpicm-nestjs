import { User } from "../modules/identity/core/domain/entities/User";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      profile?: unknown;
    }
  }
}
