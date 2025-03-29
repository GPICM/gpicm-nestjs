/* eslint-disable @typescript-eslint/no-namespace */
import { ReadStream } from "fs";
export namespace BlobStorageRepositoryTypes {
  export interface AddParams {
    key: string;
    buffer: Buffer | Uint8Array | string;
    contentType: string;
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
  ): Promise<void>;

  public abstract get(fileKey: string): Promise<Buffer | null>;

  public abstract stream(fileKey: string): ReadStream | null;

  public abstract getMetadata(
    fileKey: string
  ): Promise<BlobStorageRepositoryTypes.BlobMetadata | null>;
}
