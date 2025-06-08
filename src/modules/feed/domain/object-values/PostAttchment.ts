export class PostAttachment<A> {
  public readonly id: string;
  public readonly data: A;

  constructor(id: string, data: A) {
    this.data = data;
    this.id = id;
  }
}
