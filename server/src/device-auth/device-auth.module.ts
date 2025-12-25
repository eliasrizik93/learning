import { Module } from '@nestjs/common';
import { DeviceAuthController } from './device-auth.controller';
import { DeviceAuthService } from './device-auth.service';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { CombinedAuthGuard } from './combined-auth.guard';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [DeviceAuthController],
  providers: [DeviceAuthService, CombinedAuthGuard],
  exports: [DeviceAuthService, CombinedAuthGuard],
})
export class DeviceAuthModule {}
