/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Inject, Logger, NotFoundException } from "@nestjs/common";
import { UsersRepository } from "../domain/interfaces/repositories/users-repository";
import { UpdateUserAvatarDto, UpdateUserDataDto } from "../presentation/dtos/user-request.dtos";
import { User } from "../domain/entities/User";
import { MediaService } from "@/modules/assets/application/media.service";
import { UserAvatar } from "../domain/value-objects/user-avatar";
import { UserPublicData } from "../domain/value-objects/user-public-data";

export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @Inject(UsersRepository)
    private readonly usersRepository: UsersRepository,
    @Inject(MediaService)
    private readonly mediaService: MediaService
  ) {}

  public async getPublicUserDataByPublicId(publicId: string): Promise<UserPublicData>{
  try{
    this.logger.log(`Attempting to fetch public data for publicId: ${publicId}`);


    const user = await this.usersRepository.findByPublicId(publicId);


    if (!user) {
      throw new NotFoundException(`User with public ID ${publicId} not found.`);
    }


    const userPublicData: UserPublicData = {
      name: user.name,
      bio: user.bio,
      avatarUrl: user.avatar?.avatarUrl
    };


    this.logger.log(`Successfully fetched public data for publicId: ${publicId}`);
    return userPublicData;
    } catch(error){
    this.logger.error("Failed to get public user data", { error });
    throw error;
    }
  }

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
    try {
      this.logger.log("Updating user location", userData);

      if (userData.name) {
        user.name = userData.name;
      }

      if (userData.gender) {
        user.gender = userData.gender;
      }

      if (userData.bio) {
        user.bio = userData.bio;
      }

      if (userData.birthDate) {
        user.birthDate = userData.birthDate;
      }

      if (userData.phoneNumber) {
        user.phoneNumber = userData.phoneNumber;
      }

      await this.usersRepository.update(user);

      this.logger.log("User data updated successfully");
    } catch (error: unknown) {
      this.logger.error("Failed to update user data", { error });
      throw error;
    }
  }

  public async updateUserAvatar(user: User, userData: UpdateUserAvatarDto) {
    try {
      this.logger.log("Updating user location", userData);

      const { avatarMediaId } = userData;

      if (!avatarMediaId) {
        user.setAvatar(null);
      } else {
        this.logger.log("Looking for avatar mediaId", {
          avatarMediaId,
        });

        const media = await this.mediaService.findOneById(user, avatarMediaId);

        if (media?.sources) {
          this.logger.log("Media Found, assigning avatar to user", {
            avatarMediaId,
          });

          user.setAvatar(new UserAvatar(media.sources));
        }
      }

      await this.usersRepository.update(user);

      this.logger.log("User data updated successfully");
    } catch (error: unknown) {
      this.logger.error("Failed to update user data", { error });
      throw error;
    }
  }
}
