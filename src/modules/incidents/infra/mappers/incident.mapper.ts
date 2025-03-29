/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Incident as PrismaIncident } from "@prisma/client";

import { Incident } from "../../domain/entities/Incident";

class IncidentAssembler {
  public static toPrisma(incident: Incident): PrismaIncident {

    console.log({ incident });
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
      incidentType: incident.incidentType,
      authorId: incident.authorId,
    };
  }

  public static fromPrisma(
    prismaData?: PrismaIncident | null
  ): Incident | null {
    if (!prismaData) return null;
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
      incidentType: prismaData.incidentType,
      authorId: prismaData.authorId,
    });
  }

  public static fromPrismaMany(prismaDataArray: PrismaIncident[]): Incident[] {
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
