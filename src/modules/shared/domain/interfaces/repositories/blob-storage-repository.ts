/* eslint-disable @typescript-eslint/no-namespace */

export namespace BlobStorageRepositoryTypes {
  export interface AddParams {
    key: string;
    buffer: Buffer | Uint8Array | string;
    contentType: string;
  }

  export interface BlobData {
    buffer: Buffer | Uint8Array | string;
    key: string;
    location: string;
    contentType: string;
    size: number;
  }
}

export abstract class BlobStorageRepository {
  public abstract add(
    params: BlobStorageRepositoryTypes.AddParams
  ): Promise<BlobStorageRepositoryTypes.BlobData>;

  public abstract get(fileKey: string): Promise<Buffer | null>;

}
