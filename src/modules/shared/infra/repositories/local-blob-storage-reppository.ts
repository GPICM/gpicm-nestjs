import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import {
  BlobStorageRepository,
  BlobStorageRepositoryTypes,
} from "../../domain/interfaces/repositories/blob-storage-repository";

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
  ): Promise<BlobStorageRepositoryTypes.BlobData> {
    const { key, buffer, contentType } = params;
    const filePath = path.join(this.storageDirectory, key);

    await promisify(fs.writeFile)(filePath, buffer);

    // Get file stats
    const stats = await promisify(fs.stat)(filePath);

    // Return BlobData with metadata
    return {
      key,
      location: filePath,
      contentType,
      size: stats.size,
      buffer,
    };
  }

  public async get(fileKey: string): Promise<Buffer | null> {
    const filePath = path.join(this.storageDirectory, fileKey);
    try {
      const data = await promisify(fs.readFile)(filePath);
      return data;
    } catch (error) {
      console.error("Error reading file:", error);
      return null;
    }
  }
}
