import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly s3Service: S3Service) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const url = await this.s3Service.uploadFile(file, 'images');
    return { imageUrl: url };
  }
}
