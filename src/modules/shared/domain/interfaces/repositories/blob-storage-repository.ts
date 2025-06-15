/* eslint-disable @typescript-eslint/no-namespace */
import { Readable } from "stream";

export namespace BlobStorageRepositoryTypes {
  export interface AddParams {
    fileName: string;
    buffer: Buffer | Uint8Array | string;
    contentType?: string;
  }
  export interface BlobMetadata {
    fileName: string;
    location: string;
    contentType: string;
    size: number;
  }
}

export abstract class BlobStorageRepository {
  public abstract add(
    params: BlobStorageRepositoryTypes.AddParams
  ): Promise<BlobStorageRepositoryTypes.BlobMetadata>;

  public abstract get(fileName: string): Promise<Buffer | null>;

  public abstract stream(fileName: string): Promise<Readable | null>;

  public abstract getMetadata(
    fileName: string
  ): Promise<BlobStorageRepositoryTypes.BlobMetadata | null>;
}
