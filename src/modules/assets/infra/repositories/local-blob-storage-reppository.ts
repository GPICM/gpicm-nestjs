/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import * as mime from "mime-types";

import {
  BlobStorageRepository,
  BlobStorageRepositoryTypes,
} from "../../../shared/domain/interfaces/repositories/blob-storage-repository";
import { Logger } from "@nestjs/common";
import { Readable } from "stream";

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
  ): Promise<BlobStorageRepositoryTypes.BlobMetadata> {
    const { fileName, buffer } = params;
    try {
      /* Ensure sub folder exists */
      const folder = fileName.split("/")?.[0];
      if (folder) {
        const fullDir = path.join(this.storageDirectory, folder);
        fs.mkdirSync(fullDir, { recursive: true });
      }

      const filePath = this.resolveFilePath(fileName);

      await promisify(fs.writeFile)(filePath, buffer);
      this.logger.log(`File written: ${filePath}`);

      const stats = fs.statSync(filePath);
      const mimeType = mime.lookup(filePath) || "application/octet-stream";

      return {
        contentType: mimeType,
        storageKey: filePath,
        location: `${process.env.ASSETS_HOST}/${fileName}`,
        size: stats.size,
      };
    } catch (error) {
      this.logger.error(`Error writing file`, { params, error });
      throw error;
    }
  }

  public async get(fileName: string): Promise<Buffer | null> {
    const filePath = this.resolveFilePath(fileName);
    try {
      const data = await promisify(fs.readFile)(filePath);
      this.logger.log(`File read: ${filePath}`);
      return data ?? null;
    } catch (error) {
      this.logger.error(`Error reading file [${filePath}]`, { error });
      return null;
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async stream(fileName: string): Promise<Readable | null> {
    const filePath = this.resolveFilePath(fileName);
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
    fileName: string
  ): Promise<BlobStorageRepositoryTypes.BlobMetadata | null> {
    const filePath = this.resolveFilePath(fileName);
    try {
      const stats = await promisify(fs.stat)(filePath);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const mimeType = mime.lookup(filePath) || "application/octet-stream";

      this.logger.log(`Metadata retrieved for file: ${filePath}`);
      return {
        location: filePath,
        contentType: mimeType,
        storageKey: filePath,
        size: stats.size,
      };
    } catch (error) {
      this.logger.error(`Error getting metadata for file [${filePath}]`, {
        error,
      });
      return null;
    }
  }

  private resolveFilePath(fileName: string): string {
    return path.join(this.storageDirectory, fileName);
  }
}
