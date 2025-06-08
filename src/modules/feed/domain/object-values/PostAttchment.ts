export class PostAttachment<A> {
  public readonly id: string;
  public readonly data: A;
  public readonly resourceName: string;

  constructor(id: string, data: A, name: string) {
    this.id = id;
    this.resourceName = name;
    this.data = data;
  }
}
