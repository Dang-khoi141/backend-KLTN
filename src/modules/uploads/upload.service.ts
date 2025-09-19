import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service {
  private s3: S3Client;
  private bucketName: string;

  constructor() {
    this.s3 = new S3Client({
      region: process.env.AWS_S3_REGION || '',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY || '',
        secretAccessKey: process.env.AWS_SECRET_KEY || '',
      },
    });
    this.bucketName = process.env.AWS_S3_BUCKET || '';
  }

  async uploadFile(file: Express.Multer.File, folder: string = 'uploads') {
    const key = `${folder}/${uuid()}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3.send(command);

    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`;
  }

  async uploadFromUrl(fileUrl: string, folder: string = 'uploads') {
    const response = await axios.get(fileUrl, {
      responseType: 'arraybuffer',
      timeout: 30000, // 30 seconds timeout
      maxContentLength: 10 * 1024 * 1024, // 10MB max
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; S3Uploader/1.0)',
        Accept: 'image/*',
      },
    });

    const buffer = Buffer.from(response.data);
    const contentType = response.headers['content-type'];
    const key = `${folder}/${uuid()}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await this.s3.send(command);

    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`;
  }

  async deleteFile(fileUrl: string, folder: string = 'uploads') {
    const url = new URL(fileUrl);
    const fileName = url.pathname.substring(1);
    const key = `${folder}/${fileName}`;

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3.send(command);
  }
}
