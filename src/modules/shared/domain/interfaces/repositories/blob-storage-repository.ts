/* eslint-disable @typescript-eslint/no-namespace */
import { Readable } from "stream";

export namespace BlobStorageRepositoryTypes {
  export interface AddParams {
    key: string;
    folder: string;
    buffer: Buffer | Uint8Array | string;
    contentType?: string;
  }
  export interface BlobMetadata {
    key: string;
    location: string;
    contentType: string;
    size: number;
  }
}

export abstract class BlobStorageRepository {
  public abstract add(
    params: BlobStorageRepositoryTypes.AddParams
  ): Promise<BlobStorageRepositoryTypes.BlobMetadata>;

  public abstract get(fileKey: string): Promise<Buffer | null>;

  public abstract stream(fileKey: string): Promise<Readable | null>;

  public abstract getMetadata(
    fileKey: string
  ): Promise<BlobStorageRepositoryTypes.BlobMetadata | null>;
}
