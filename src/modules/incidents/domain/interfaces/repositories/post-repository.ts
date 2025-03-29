import { Post } from "../../entities/Post";

export abstract class PostRepository {
  abstract add(post: Post): Promise<void>;

  abstract findBySlug(slug: string): Promise<Post | null>;

  abstract listAll(): Promise<Post[]>;
}
