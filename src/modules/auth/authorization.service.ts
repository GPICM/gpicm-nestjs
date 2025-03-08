/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from "@nestjs/common";
import { Encryptor } from "./domain/interfaces/jwt-encryptor";

@Injectable()
export class AuthorizationService {
  private readonly logger = new Logger(AuthorizationService.name);

  constructor(private readonly encryptor: Encryptor<any>) {}

  public execute(accessToken: string): object | null {
    try {
      this.logger.log("Authorizing");

      const decoded = this.encryptor.validateToken(accessToken);
      if (!decoded) {
        throw new Error("Invalid accessToken");
      }

      return decoded as object;
    } catch (error: unknown) {
      this.logger.error("Failed to signin", { error });
      return null;
    }
  }
}
