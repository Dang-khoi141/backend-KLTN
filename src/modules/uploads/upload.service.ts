import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service {
  private s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      region: process.env.AWS_S3_REGION || '',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY || '',
        secretAccessKey: process.env.AWS_SECRET_KEY || '',
      },
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string = 'uploads') {
    const key = `${folder}/${uuid()}-${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET || '',
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3.send(command);

    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`;
  }
}
