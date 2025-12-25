import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { Response } from 'express';
import { join } from 'path';
import { existsSync, createReadStream } from 'fs';

@Controller()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('upload/file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const url = await this.uploadService.saveFile(
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    return { url };
  }

  @Post('upload/base64')
  async uploadBase64(@Body() body: { data: string; filename: string }) {
    if (!body.data) {
      throw new BadRequestException('No data provided');
    }

    const url = await this.uploadService.saveBase64File(
      body.data,
      body.filename || 'file.bin',
    );

    return { url };
  }

  @Get('uploads/:filename')
  async serveFile(@Param('filename') filename: string, @Res() res: Response) {
    console.log(`[Upload] Serving file: ${filename}`);
    const filePath = join(process.cwd(), 'uploads', filename);
    console.log(`[Upload] Full path: ${filePath}`);
    console.log(`[Upload] File exists: ${existsSync(filePath)}`);
    
    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    // Determine content type based on extension
    const ext = filename.split('.').pop()?.toLowerCase();
    const contentTypes: Record<string, string> = {
      'wav': 'audio/wav',
      'mp3': 'audio/mpeg',
      'ogg': 'audio/ogg',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'mp4': 'video/mp4',
      'webm': 'video/webm',
    };

    const contentType = contentTypes[ext || ''] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    
    const stream = createReadStream(filePath);
    stream.pipe(res);
  }
}
