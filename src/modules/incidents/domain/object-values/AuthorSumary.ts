import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";

export class AuthorSummary {
  id: number;
  name: string;
  publicId: string;
  profilePicture: string;

  constructor(args: NonFunctionProperties<AuthorSummary>) {
    Object.assign(this, args);
  }
}
