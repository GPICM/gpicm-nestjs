import { User } from "../modules/identity/domain/entities/User";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
