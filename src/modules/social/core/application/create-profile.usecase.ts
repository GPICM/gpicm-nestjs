import { Profile } from "@/modules/social/core/domain/entities/Profile";
import { Inject, Injectable } from "@nestjs/common";
import { ProfileRepository } from "../domain/interfaces/repositories/profile-repository";
import {
  generateBaseHandle,
  generateHandleCandidates,
} from "@/modules/shared/utils/handle-generator";
import { User } from "@/modules/identity/core/domain/entities/User";

@Injectable()
export class CreateProfileUseCase {
  constructor(
    @Inject(ProfileRepository)
    private readonly profileRepository: ProfileRepository
  ) {}

  async execute(
    user: User,
    options?: { txContext?: unknown }
  ): Promise<Profile> {
    const baseHandle = generateBaseHandle(user.name || "Usuario");
    const candidates = generateHandleCandidates(baseHandle, 10);

    let handle: string | null = null;

    for (const candidate of candidates) {
      const exists = await this.profileRepository.findByHandle(candidate);
      if (!exists) {
        handle = candidate;
        break;
      }
    }

    if (!handle) {
      handle = `${baseHandle}${Math.floor(Math.random() * 10000)}`;
    }

    const profile = Profile.fromUser(user, user.name || "Usuario", handle);
    await this.profileRepository.create(profile, options);

    return profile;
  }
}
