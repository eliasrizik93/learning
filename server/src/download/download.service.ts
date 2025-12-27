import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { createReadStream, existsSync, statSync } from 'fs';
import { join, basename, normalize } from 'path';
import { createHash } from 'crypto';
import { readFile } from 'fs/promises';

export interface DownloadableFile {
  id: string;
  name: string;
  displayName: string;
  description: string;
  version: string;
  fileName: string;
  fileSize: number;
  sha256?: string;
  supportedOS: string[];
  requirements: string[];
}

@Injectable()
export class DownloadService {
  private readonly logger = new Logger(DownloadService.name);
  private readonly downloadsDir: string;
  private readonly availableDownloads: Map<string, DownloadableFile> = new Map();

  constructor(private readonly db: DatabaseService) {
    this.downloadsDir = join(process.cwd(), 'downloads');
    this.initializeDownloads();
  }

  private async initializeDownloads() {
    // Register available downloads
    const captureAudio: DownloadableFile = {
      id: 'anki-capture-studio',
      name: 'Anki Capture Studio',
      displayName: 'Anki Capture Studio',
      description: 'A powerful desktop application for creating Anki flashcards from audio recordings and screenshots. Capture audio from any application, take screenshots, and automatically generate flashcards with hotkeys.',
      version: '1.0.0',
      fileName: 'anki-capture-studio.zip',
      fileSize: 0,
      supportedOS: ['Windows', 'macOS', 'Linux'],
      requirements: [
        'Python 3.8 or higher',
        'pip (Python package manager)',
        'Working audio output device',
      ],
    };

    const filePath = join(this.downloadsDir, captureAudio.fileName);
    if (existsSync(filePath)) {
      const stats = statSync(filePath);
      captureAudio.fileSize = stats.size;
      
      // Calculate SHA256
      try {
        const fileBuffer = await readFile(filePath);
        captureAudio.sha256 = createHash('sha256').update(fileBuffer).digest('hex');
      } catch (e) {
        this.logger.warn('Failed to calculate SHA256 for download file');
      }
    }

    this.availableDownloads.set(captureAudio.id, captureAudio);
  }

  getAvailableDownloads(): DownloadableFile[] {
    return Array.from(this.availableDownloads.values());
  }

  getDownloadInfo(fileId: string): DownloadableFile | null {
    return this.availableDownloads.get(fileId) || null;
  }

  async getFileStream(fileId: string, userId?: number, ipAddress?: string, userAgent?: string) {
    const downloadInfo = this.availableDownloads.get(fileId);
    
    if (!downloadInfo) {
      throw new NotFoundException('Download not found');
    }

    // Validate file path to prevent directory traversal
    const fileName = basename(downloadInfo.fileName);
    const filePath = normalize(join(this.downloadsDir, fileName));
    
    // Ensure the file path is within downloads directory
    if (!filePath.startsWith(normalize(this.downloadsDir))) {
      throw new BadRequestException('Invalid file path');
    }

    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found on server');
    }

    // Log the download
    await this.logDownload(fileName, userId, ipAddress, userAgent);

    const stats = statSync(filePath);
    const stream = createReadStream(filePath);

    return {
      stream,
      fileName,
      fileSize: stats.size,
      mimeType: 'application/zip',
    };
  }

  private async logDownload(fileName: string, userId?: number, ipAddress?: string, userAgent?: string) {
    try {
      await this.db.downloadLog.create({
        data: {
          fileName,
          userId,
          ipAddress,
          userAgent,
        },
      });
      this.logger.log(`Download logged: ${fileName} by user ${userId || 'anonymous'}`);
    } catch (e) {
      this.logger.error('Failed to log download:', e);
    }
  }

  async getDownloadStats() {
    try {
      const totalDownloads = await this.db.downloadLog.count();
      const last24Hours = await this.db.downloadLog.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      });
      const last7Days = await this.db.downloadLog.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      });

      return {
        success: true,
        data: {
          total: totalDownloads,
          last24Hours,
          last7Days,
        },
      };
    } catch (e) {
      this.logger.error('Failed to get download stats:', e);
      return { success: false, message: 'Failed to get stats' };
    }
  }
}

