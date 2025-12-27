import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { DatabaseModule } from '../database/database.module';
import { EventsModule } from '../events/events.module';
import { DeviceAuthModule } from '../device-auth/device-auth.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, EventsModule, DeviceAuthModule, AuthModule],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}

