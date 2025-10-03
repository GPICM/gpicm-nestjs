import { Profile } from "@/modules/social/core/domain/entities/Profile";
import { Inject, Injectable } from "@nestjs/common";
import { ProfileRepository } from "../domain/interfaces/repositories/profile-repository";

import { User } from "@/modules/identity/core/domain/entities/User";

@Injectable()
export class FindProfileByUserUseCase {
  constructor(
    @Inject(ProfileRepository)
    private readonly profileRepository: ProfileRepository
  ) {}

  async execute(user: User): Promise<Profile | null> {
    const profile = await this.profileRepository.findByUserId(user.id);
    return profile;
  }
}
