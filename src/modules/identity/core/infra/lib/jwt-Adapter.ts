/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import jwt, { verify } from "jsonwebtoken";
import { Encryptor } from "../../domain/interfaces/jwt-encryptor";

class JwtAdapter<Payload> implements Encryptor<Payload> {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string
  ) {}

  validateToken(token: string): Payload | null {
    try {
      const result = verify(token, this.secret);
      return <Payload>result;
    } catch {
      return null;
    }
  }

  generateToken(payload: Payload): string {
    return jwt.sign(payload as object, this.secret, {
      expiresIn: this.expiresIn as unknown as any,
    });
  }
}

export { JwtAdapter };
