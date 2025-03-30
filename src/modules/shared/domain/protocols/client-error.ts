export class ClientError extends Error {
  code: string;
  message: string;

  public constructor(code: string, message?: string) {
    super(message ?? "Client Error");
    this.code = code;
    this.name = this.constructor.name;
  }

  public getMessage(): string {
    return this.message;
  }

  public toObject(): Record<string, unknown> | null {
    return {
      code: this.code,
      message: this.message,
    };
  }

  public toJSON(): Record<string, unknown> | null {
    return this.toObject();
  }

  public toString(): string {
    return JSON.stringify(this.toObject());
  }
}
