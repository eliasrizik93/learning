import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MessageModule } from './message/message.module';
import { GroupModule } from './group/group.module';
import { CardModule } from './card/card.module';
import { UploadModule } from './upload/upload.module';
import { DatabaseModule } from './database/database.module';
import { DeviceAuthModule } from './device-auth/device-auth.module';
import { EventsModule } from './events/events.module';
import { NotificationModule } from './notification/notification.module';
import { SupportModule } from './support/support.module';
import { DiscoverModule } from './discover/discover.module';
import { DownloadModule } from './download/download.module';

@Module({
  imports: [
    UserModule, 
    AuthModule, 
    MessageModule, 
    GroupModule, 
    CardModule, 
    DeviceAuthModule, 
    UploadModule, 
    DatabaseModule, 
    EventsModule,
    NotificationModule,
    SupportModule,
    DiscoverModule,
    DownloadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
