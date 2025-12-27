import { Module } from '@nestjs/common';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { DatabaseModule } from '../database/database.module';
import { NotificationModule } from '../notification/notification.module';
import { DeviceAuthModule } from '../device-auth/device-auth.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, NotificationModule, DeviceAuthModule, AuthModule],
  controllers: [SupportController],
  providers: [SupportService],
  exports: [SupportService],
})
export class SupportModule {}

