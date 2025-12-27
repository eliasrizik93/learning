import {
  Controller,
  Get,
  Param,
  Res,
  Req,
  UseGuards,
  Optional,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { DownloadService } from './download.service';
import { GetUser, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';

@Controller('download')
export class DownloadController {
  constructor(private readonly downloadService: DownloadService) {}

  @Get('list')
  async getAvailableDownloads() {
    const downloads = this.downloadService.getAvailableDownloads();
    return { success: true, data: downloads };
  }

  @Get('info/:fileId')
  async getDownloadInfo(@Param('fileId') fileId: string) {
    const info = this.downloadService.getDownloadInfo(fileId);
    if (!info) {
      return { success: false, message: 'Download not found' };
    }
    return { success: true, data: info };
  }

  @Get('file/:fileId')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 downloads per minute
  async downloadFile(
    @Param('fileId') fileId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      // Get user ID from token if available (optional auth)
      let userId: number | undefined;
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        // Optionally extract user from token - for now we'll skip this for public downloads
      }

      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const { stream, fileName, fileSize, mimeType } = await this.downloadService.getFileStream(
        fileId,
        userId,
        ipAddress,
        userAgent,
      );

      // Set secure download headers
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', fileSize);
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

      stream.pipe(res);
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };
      if (err.status === 404) {
        res.status(404).json({ success: false, message: err.message });
      } else if (err.status === 400) {
        res.status(400).json({ success: false, message: err.message });
      } else {
        res.status(500).json({ success: false, message: 'Download failed' });
      }
    }
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats(@GetUser() user: { id: number }) {
    // This could be admin-only in a real app
    return this.downloadService.getDownloadStats();
  }
}

