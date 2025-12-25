import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { CardService } from '../card/card.service';
import { DeviceAuthModule } from '../device-auth/device-auth.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, DeviceAuthModule, AuthModule],
  controllers: [GroupController],
  providers: [GroupService, CardService],
  exports: [GroupService],
})
export class GroupModule {}
