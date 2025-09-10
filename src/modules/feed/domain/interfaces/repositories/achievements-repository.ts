import { Achievement } from "@/modules/feed/domain/entities/Achievement";

export abstract class AchievementsRepository {
  abstract add(achievement: Achievement): Promise<void>;
  abstract findById(id: number): Promise<Achievement | null>;
  abstract listAll(filters?: {
    limit?: number;
    offset?: number;
  }): Promise<Achievement[]>;
  abstract update(achievement: Achievement): Promise<void>;
  abstract delete(id: number): Promise<void>;
  abstract findByProfileId(profileId: number): Promise<Achievement[]>;
  abstract findByFields(fields: Partial<Achievement>): Promise<Achievement[]>;
}
