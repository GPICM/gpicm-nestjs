/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Inject, Injectable, Logger } from "@nestjs/common";
import { Encryptor } from "../domain/interfaces/jwt-encryptor";
import { UsersRepository } from "../domain/interfaces/repositories/users-repository";
import { User } from "../domain/entities/User";

@Injectable()
export class AuthorizationService {
  private readonly logger = new Logger(AuthorizationService.name);

  constructor(
    @Inject(Encryptor)
    private readonly encryptor: Encryptor<{ sub: string }>,
    private readonly usersRepository: UsersRepository
  ) {}

  public async execute(accessToken: string): Promise<User | null> {
    try {
      this.logger.log("Authorizing guest");

      const decoded = this.encryptor.validateToken(accessToken);
      if (!decoded) {
        throw new Error("Invalid accessToken");
      }

      if (!decoded.sub) {
        throw new Error("Invalid accessToken");
      }

      const user = await this.usersRepository.findByPublicId(decoded.sub);

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    } catch (error: unknown) {
      this.logger.error("Failed to signin", { error });
      return null;
    }
  }
}
