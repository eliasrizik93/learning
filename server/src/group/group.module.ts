import { Module, forwardRef, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { DatabaseModule } from '../database/database.module';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { CardService } from '../card/card.service';
import { DeviceAuthModule } from '../device-auth/device-auth.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';
import { NotificationService } from '../notification/notification.service';

@Module({
  imports: [DatabaseModule, DeviceAuthModule, AuthModule, forwardRef(() => NotificationModule)],
  controllers: [GroupController],
  providers: [GroupService, CardService],
  exports: [GroupService],
})
export class GroupModule implements OnModuleInit {
  constructor(
    private moduleRef: ModuleRef,
    private groupService: GroupService,
  ) {}

  onModuleInit() {
    // Inject notification service after module initialization to avoid circular dependency
    const notificationService = this.moduleRef.get(NotificationService, { strict: false });
    if (notificationService) {
      this.groupService.setNotificationService(notificationService);
    }
  }
}
