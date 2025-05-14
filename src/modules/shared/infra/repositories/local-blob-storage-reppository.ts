/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import * as mime from "mime-types";

import {
  BlobStorageRepository,
  BlobStorageRepositoryTypes,
} from "../../domain/interfaces/repositories/blob-storage-repository";
import { ReadStream } from "fs";
import { Logger } from "@nestjs/common";

export class LocalBlobStorageRepository extends BlobStorageRepository {
  private readonly logger: Logger = new Logger(LocalBlobStorageRepository.name);
  private storageDirectory: string;

  constructor(storageDirectory: string) {
    super();
    this.storageDirectory = storageDirectory;

    try {
      if (!fs.existsSync(this.storageDirectory)) {
        fs.mkdirSync(this.storageDirectory, { recursive: true });
        this.logger.log(`Storage directory created: ${this.storageDirectory}`);
      }
    } catch (error) {
      this.logger.error("Error ensuring storage directory", { error });
      throw error;
    }
  }

  public async add(
    params: BlobStorageRepositoryTypes.AddParams
  ): Promise<void> {
    const { key, buffer } = params;
    const filePath = path.join(this.storageDirectory, key);

    try {
      await promisify(fs.writeFile)(filePath, buffer);
      this.logger.log(`File written: ${filePath}`);
    } catch (error) {
      this.logger.error(`Error writing file [${filePath}]`, { error });
      throw error;
    }
  }

  public async get(fileKey: string): Promise<Buffer | null> {
    const filePath = path.join(this.storageDirectory, fileKey);
    try {
      const data = await promisify(fs.readFile)(filePath);
      this.logger.log(`File read: ${filePath}`);
      return data ?? null;
    } catch (error) {
      this.logger.error(`Error reading file [${filePath}]`, { error });
      return null;
    }
  }

  public stream(fileKey: string): ReadStream | null {
    const filePath = path.join(this.storageDirectory, fileKey);

    try {
      if (!fs.existsSync(filePath)) {
        this.logger.warn(`File not found: ${filePath}`);
        return null;
      }

      this.logger.log(`Creating read stream for file: ${filePath}`);
      return fs.createReadStream(filePath);
    } catch (error) {
      this.logger.error(`Error creating read stream [${filePath}]`, { error });
      return null;
    }
  }

  public async getMetadata(
    fileKey: string
  ): Promise<BlobStorageRepositoryTypes.BlobMetadata | null> {
    const filePath = path.join(this.storageDirectory, fileKey);
    try {
      const stats = await promisify(fs.stat)(filePath);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const mimeType = mime.lookup(filePath) || "application/octet-stream";

      this.logger.log(`Metadata retrieved for file: ${filePath}`);
      return {
        key: fileKey,
        location: filePath,
        contentType: mimeType,
        size: stats.size,
      };
    } catch (error) {
      this.logger.error(`Error getting metadata for file [${filePath}]`, {
        error,
      });
      return null;
    }
  }
}
