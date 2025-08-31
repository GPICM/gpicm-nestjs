import { Profile } from "@/modules/feed/domain/entities/Profile";
import { Injectable } from "@nestjs/common";
import {
  PrismaProfileFollowRepository,
  PrismaProfileRepository,
} from "@/modules/feed/infra/prisma-profile-repository";

@Injectable()
export class ProfileService {
  constructor(
    private readonly profileRepository: PrismaProfileRepository,
    private readonly profileFollowRepository: PrismaProfileFollowRepository
  ) {}

  async refreshPostCount(userId: number): Promise<void> {
    await this.profileRepository.refreshPostCount(userId);
  }

  async getProfile(userId: number): Promise<Profile | null> {
    return await this.profileRepository.findByUserId(userId);
  }

  async createProfile(profile: Profile): Promise<Profile> {
    return await this.profileRepository.create(profile);
  }

  async updateProfile(profile: Profile): Promise<Profile> {
    return await this.profileRepository.update(profile);
  }

  async deleteProfile(id: number): Promise<void> {
    await this.profileRepository.delete(id);
  }
}
