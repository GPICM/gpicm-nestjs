import { Injectable } from "@nestjs/common";
import { Policy } from "../entities/Policy";

@Injectable()
export abstract class PoliciesRepository {
  abstract findLatestPolicies(): Promise<Policy[]>;
}
