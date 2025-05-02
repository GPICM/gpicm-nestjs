/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Prisma, Incident as PrismaIncident } from "@prisma/client";

import { Incident } from "../../domain/entities/Incident";
import { AuthorSummary } from "../../domain/object-values/AuthorSumary";

export const incidentInclude = Prisma.validator<Prisma.IncidentInclude>()({
  Author: true,
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
      imageUrl: incident.imageUrl,
      incidentDate: incident.incidentDate,
      imagePreviewUrl: incident.imagePreviewUrl,
      observation: incident.observation,
      reporterName: incident.reporterName,
      status: incident.status,
      incidentTypeId: incident.incidentTypeId,
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
      profilePicture: Author.profilePicture ?? "",
      publicId: Author.publicId,
    });

    return new Incident({
      id: prismaData.id,
      title: prismaData.title,
      description: prismaData.description,
      incidentDate: prismaData.incidentDate,
      imageUrl: prismaData.imageUrl,
      imagePreviewUrl: prismaData.imagePreviewUrl,
      latitude: prismaData.latitude,
      longitude: prismaData.longitude,
      address: prismaData.address,
      observation: prismaData.observation,
      reporterName: prismaData.reporterName,
      status: prismaData.status,
      incidentTypeId: prismaData.incidentTypeId,
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
