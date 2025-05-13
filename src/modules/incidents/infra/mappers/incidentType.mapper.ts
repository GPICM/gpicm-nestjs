/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { IncidentTypes as PrismaIncidentType } from "@prisma/client";

import { IncidentType } from "../../domain/entities/IncidentType";

/* export const incidentTypeInclude = Prisma.validator<Prisma.IncidentTypesInclude>()({
  Incident: false,
});

type IncidentTypeJoinModel = Prisma.IncidentTypesGetPayload<{
  include: typeof incidentTypeInclude;
}>; */

class IncidentTypeAssembler {
  public static toPrisma(incidentType: IncidentType): PrismaIncidentType {
    return {
      id: incidentType.id!,
      name: incidentType.name,
      description: incidentType.description,
      internalId: incidentType.internalId,
    };
  }

  public static fromPrisma(
    prismaData?: PrismaIncidentType | null
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
    prismaDataArray: PrismaIncidentType[]
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
