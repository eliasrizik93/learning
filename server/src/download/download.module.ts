import { Module } from '@nestjs/common';
import { DownloadController } from './download.controller';
import { DownloadService } from './download.service';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    DatabaseModule, 
    AuthModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
  ],
  controllers: [DownloadController],
  providers: [DownloadService],
  exports: [DownloadService],
})
export class DownloadModule {}

