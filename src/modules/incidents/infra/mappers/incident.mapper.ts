/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Prisma, Incident as PrismaIncident } from "@prisma/client";

import { Incident } from "../../domain/entities/Incident";
import { AuthorSummary } from "../../domain/object-values/AuthorSumary";
import { IncidentType } from "../../domain/entities/IncidentType";

export const incidentInclude = Prisma.validator<Prisma.IncidentInclude>()({
  Author: true,
  IncidentType: true,
});

type IncidentJoinModel = Prisma.IncidentGetPayload<{
  include: typeof incidentInclude;
}>;
class IncidentAssembler {
  public static toPrisma(incident: Incident): PrismaIncident {
    return {
      id: incident.id,
      title: incident.title,
      description: incident.description,
      latitude: incident.latitude,
      longitude: incident.longitude,
      address: incident.address,
      incidentDate: incident.incidentDate,
      observation: incident.observation,
      reporterName: incident.reporterName,
      status: incident.status,
      incidentTypeId: incident.incidentType.id!,
      authorId: incident.author.id,
    };
  }

  public static fromPrisma(
    prismaData?: IncidentJoinModel | null
  ): Incident | null {
    if (!prismaData) return null;

    const { Author } = prismaData;

    const author = new AuthorSummary({
      id: Author.id,
      name: Author.name ?? "Anônimo",
      publicId: Author.publicId,
    });

    const incidentType = new IncidentType({
      id: prismaData.incidentTypeId,
      name: prismaData.IncidentType.name,
      description: prismaData.IncidentType.description,
      imageUrl: prismaData.IncidentType.imageUrl,
      internalId: prismaData.IncidentType.internalId,
      slug: prismaData.IncidentType.slug,
    });

    return new Incident({
      id: prismaData.id,
      title: prismaData.title,
      description: prismaData.description,
      incidentDate: prismaData.incidentDate,
      latitude: prismaData.latitude,
      longitude: prismaData.longitude,
      address: prismaData.address,
      observation: prismaData.observation,
      reporterName: prismaData.reporterName,
      status: prismaData.status,
      incidentType,
      author,
    });
  }

  public static fromPrismaMany(
    prismaDataArray: IncidentJoinModel[]
  ): Incident[] {
    const incidents: Incident[] = [];
    for (const prismaData of prismaDataArray) {
      const incident = this.fromPrisma(prismaData);
      if (incident) {
        incidents.push(incident);
      }
    }
    return incidents;
  }
}

export { IncidentAssembler };
