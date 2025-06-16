/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BlobStorageRepository,
  BlobStorageRepositoryTypes,
} from "../../../shared/domain/interfaces/repositories/blob-storage-repository";
import {
  S3Client,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

import { Readable } from "stream";
import { Logger } from "@nestjs/common";
import mimeType from "mime-types";

const AWS_REGION = String(process.env.AWS_REGION);

export class S3Adapter extends BlobStorageRepository {
  private readonly logger = new Logger(S3Adapter.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;

  constructor(bucket: string) {
    super();
    this.bucket = bucket;
    this.s3Client = new S3Client({
      region: AWS_REGION,
    });
  }

  public async add(
    params: BlobStorageRepositoryTypes.AddParams
  ): Promise<BlobStorageRepositoryTypes.BlobMetadata> {
    const { fileName, buffer, contentType } = params;

    try {
      this.logger.log("Uploading blob to s3", { params });
      const resolvedContentType =
        contentType || mimeType.lookup(fileName) || "application/octet-stream";

      const upload = new Upload({
        client: this.s3Client,
        params: {
          Key: fileName,
          Body: buffer,
          Bucket: this.bucket,
          ContentType: resolvedContentType,
        },
      });

      const result = await upload.done();

      if (!result.Location || !result.Key) {
        this.logger.error("S3 client could not resolve Location", {
          params,
          result,
        });
        throw new Error("S3 client could not resolve Location");
      }

      const size =
        typeof buffer === "string" ? Buffer.byteLength(buffer) : buffer.length;

      this.logger.log(`File uploaded to S3: ${fileName}`);

      return {
        size,
        storageKey: result.Key,
        location: result.Location,
        contentType: resolvedContentType,
      };
    } catch (error) {
      this.logger.error(`Error uploading file [${fileName}] to S3`, {
        message: (error as Error).message,
        stack: (error as Error).stack,
      });
      throw error;
    }
  }

  public async get(fileKey: string): Promise<Buffer | null> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: fileKey,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body || !(response.Body instanceof Readable)) {
        return null;
      }

      const chunks: Uint8Array[] = [];
      for await (const chunk of response.Body) {
        chunks.push(chunk as Uint8Array);
      }

      this.logger.log(`File downloaded from S3: ${fileKey}`);
      return Buffer.concat(chunks);
    } catch (error) {
      this.logger.error(`Error downloading file [${fileKey}] from S3`, {
        error,
      });
      return null;
    }
  }

  public async stream(fileKey: string): Promise<Readable | null> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: fileKey,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body || !(response.Body instanceof Readable)) {
        return null;
      }

      this.logger.log(`Streaming file from S3: ${fileKey}`);
      return response.Body;
    } catch (error) {
      this.logger.error(`Error creating stream for [${fileKey}]`, { error });
      return null;
    }
  }

  public async getMetadata(
    storageKey: string
  ): Promise<BlobStorageRepositoryTypes.BlobMetadata | null> {
    try {
      const headResult = await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: storageKey,
        })
      );

      const resolvedContentType =
        mimeType.lookup(storageKey) || "application/octet-stream";

      this.logger.log(`Metadata retrieved from S3: ${storageKey}`);
      return {
        storageKey: storageKey,
        contentType: resolvedContentType,
        location: `s3://${this.bucket}/`,
        size: headResult.ContentLength ?? 0,
      };
    } catch (error) {
      this.logger.error(`Error getting metadata for file []`, {
        error,
      });
      return null;
    }
  }
}
