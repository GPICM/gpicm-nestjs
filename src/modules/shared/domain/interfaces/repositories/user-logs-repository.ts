import { UserLog } from "../../entities/UserLog";

export abstract class UserLogsRepository {
  abstract add(user: UserLog, tx?: unknown): Promise<void>;
}
