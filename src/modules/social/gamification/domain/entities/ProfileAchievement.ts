import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";

export class ProfileAchievement {
  public id: number;
  public handle: string;
  public profileId: number;
  public achievementId: number;
  public criteriaSnapshot: string;
  public rewardsSnapshot: string;

  constructor(args: NonFunctionProperties<ProfileAchievement>) {
    Object.assign(this, args);
  }
}
