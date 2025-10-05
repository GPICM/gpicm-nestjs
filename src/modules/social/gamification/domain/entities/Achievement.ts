import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { AchievementCriterion } from "../value-objects/AchievementCriterion";
import { AchievementReward } from "../value-objects/AchievementReward";
import { MediaSource } from "@/modules/assets/domain/object-values/media-source";

export class Achievement {
  public id: number;

  public readonly name: string;

  public readonly description: string;

  public readonly criteria: AchievementCriterion[];

  public readonly rewards: AchievementReward[];

  public readonly imageSources: MediaSource | null;

  public readonly imageThumbNailUrl: string;

  public readonly imageBlurHash: string;

  constructor(args: NonFunctionProperties<Achievement>) {
    Object.assign(this, args);
  }

  public toJSON() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { criteria, ...rest } = this;
    return { ...rest };
  }
}
