export abstract class Encryptor<Payload> {
  abstract generateToken(payload: Payload): string;
  abstract validateToken(token: string): Payload | null;
}
