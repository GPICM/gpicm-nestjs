/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Prisma, IncidentTypes as PrismaIncidentType } from "@prisma/client";

import { IncidentType } from "../../domain/entities/incidentType";

export const incidentTypeInclude = Prisma.validator<Prisma.IncidentTypesInclude>()({
  Incident: false,
});

type IncidentTypeJoinModel = Prisma.IncidentTypesGetPayload<{
  include: typeof incidentTypeInclude;
}>;

class IncidentTypeAssembler {
  public static toPrisma(incidentType: IncidentType): PrismaIncidentType {
    return {
      id: incidentType.id,
      name: incidentType.name,
      description: incidentType.description,
      internalId: incidentType.internalId,
    };
  }

  public static fromPrisma(
    prismaData?: IncidentTypeJoinModel | null
  ): IncidentType | null {
    if (!prismaData) return null;

    return new IncidentType({
      id: prismaData.id,
      name: prismaData.name,
      description: prismaData.description,
      internalId: prismaData.internalId,
    });
  }

  public static fromPrismaMany(
    prismaDataArray: IncidentTypeJoinModel[]
  ): IncidentType[] {
    const incidentTypes: IncidentType[] = [];
    for (const prismaData of prismaDataArray) {
      const incidentType = this.fromPrisma(prismaData);
      if (incidentType) {
        incidentTypes.push(incidentType);
      }
    }
    return incidentTypes;
  }
}

export { IncidentTypeAssembler };