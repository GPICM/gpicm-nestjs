import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";

export class PostAuthor {
  id: number;
  name: string;
  publicId: string;
  profilePicture: string;

  constructor(args: NonFunctionProperties<PostAuthor>) {
    Object.assign(this, args);
  }
}
