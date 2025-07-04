import { Injectable } from "@nestjs/common";
import { Policy } from "../entities/Policy";

@Injectable()
export abstract class PoliciesRepository {
  abstract findById(id: string): Promise<Policy | null>;

  abstract findLatestPolicies(): Promise<Policy[]>;
}
