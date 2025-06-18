import { Inject, Logger } from "@nestjs/common";
import { UsersRepository } from "../domain/interfaces/repositories/users-repository";

export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @Inject(UsersRepository)
    private readonly usersRepository: UsersRepository
  ) {}

  public async updateUserLocation(params: {
    userId: number;
    latitude: number;
    longitude: number;
  }): Promise<void> {
    try {
      this.logger.log("Updating user location", params);

      await this.usersRepository.updateLocation(
        params.userId,
        params.latitude,
        params.longitude
      );

      this.logger.log("User location updated successfully");
    } catch (error: unknown) {
      this.logger.error("Failed to update user location", { error });
      throw error;
    }
  }
}
