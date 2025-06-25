import { Inject, Logger } from "@nestjs/common";
import { UsersRepository } from "../domain/interfaces/repositories/users-repository";
import { UpdateUserDataDto } from "../presentation/dtos/user-request.dtos";
import { User } from "../domain/entities/User";

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

  public async updateUserData(user: User, userData: UpdateUserDataDto) {
    try{
      this.logger.log("Updating user location", userData);

      await this.usersRepository.updateUserData(user, userData);
      
      this.logger.log("User data updated successfully");
    } catch (error: unknown) {
      this.logger.error("Failed to update user data", { error });
      throw error;  

    }
    
  }
}
