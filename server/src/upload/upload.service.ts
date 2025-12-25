import { Injectable } from '@nestjs/common';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { randomBytes } from 'crypto';

@Injectable()
export class UploadService {
  private readonly uploadDir = join(process.cwd(), 'uploads');

  constructor() {
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    if (!existsSync(this.uploadDir)) {
      await mkdir(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
  ): Promise<string> {
    const ext = originalName.split('.').pop() || 'bin';
    const filename = `${randomBytes(16).toString('hex')}.${ext}`;
    const filepath = join(this.uploadDir, filename);

    await writeFile(filepath, buffer);

    return `/uploads/${filename}`;
  }

  async saveBase64File(
    base64Data: string,
    filename: string,
  ): Promise<string> {
    // Remove data URL prefix if present
    const base64Match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    const buffer = base64Match
      ? Buffer.from(base64Match[2], 'base64')
      : Buffer.from(base64Data, 'base64');

    const ext = filename.split('.').pop() || 'bin';
    const newFilename = `${randomBytes(16).toString('hex')}.${ext}`;
    const filepath = join(this.uploadDir, newFilename);

    await writeFile(filepath, buffer);

    return `/uploads/${newFilename}`;
  }
}
