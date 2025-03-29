/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import * as mime from "mime-types"; // Import mime-types

import {
  BlobStorageRepository,
  BlobStorageRepositoryTypes,
} from "../../domain/interfaces/repositories/blob-storage-repository";
import { ReadStream } from "fs";

export class LocalBlobStorageRepository extends BlobStorageRepository {
  private storageDirectory: string;

  constructor(storageDirectory: string) {
    super();
    this.storageDirectory = storageDirectory;

    if (!fs.existsSync(this.storageDirectory)) {
      fs.mkdirSync(this.storageDirectory, { recursive: true });
    }
  }

  public async add(
    params: BlobStorageRepositoryTypes.AddParams
  ): Promise<void> {
    const { key, buffer } = params;
    const filePath = path.join(this.storageDirectory, key);
    await promisify(fs.writeFile)(filePath, buffer);
    return;
  }

  public async get(fileKey: string): Promise<Buffer | null> {
    const filePath = path.join(this.storageDirectory, fileKey);
    try {
      const data = await promisify(fs.readFile)(filePath);
      return data ?? null;
    } catch (error) {
      console.error("Error reading file:", error);
      return null;
    }
  }

  public stream(fileKey: string): ReadStream | null {
    const filePath = path.join(this.storageDirectory, fileKey);

    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return null;
    }

    return fs.createReadStream(filePath);
  }

  public async getMetadata(
    fileKey: string
  ): Promise<BlobStorageRepositoryTypes.BlobMetadata | null> {
    const filePath = path.join(this.storageDirectory, fileKey);
    try {
      const stats = await promisify(fs.stat)(filePath);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const mimeType = mime.lookup(filePath) || "application/octet-stream";

      return {
        key: fileKey,
        location: filePath,
        contentType: mimeType,
        size: stats.size,
      };
    } catch (error) {
      console.error("Error getting metadata:", error);
      return null;
    }
  }
}
