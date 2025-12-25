import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard, GetUser } from '../auth/jwt-auth.guard';
import { DeviceAuthService } from './device-auth.service';

@Controller('device-auth')
export class DeviceAuthController {
  constructor(private readonly deviceAuthService: DeviceAuthService) {}

  @Post('request')
  async requestDeviceCode(@Body() body: { device_name?: string }) {
    return this.deviceAuthService.createDeviceAuthRequest(body.device_name);
  }

  @Post('poll')
  async pollForToken(@Body() body: { device_code: string }) {
    return this.deviceAuthService.pollForToken(body.device_code);
  }

  @Get('verify/:userCode')
  @UseGuards(JwtAuthGuard)
  async getAuthRequest(@Param('userCode') userCode: string) {
    const request = await this.deviceAuthService.getAuthRequestByUserCode(
      userCode,
    );
    if (!request) {
      return { valid: false };
    }
    if ('alreadyAuthorized' in request && request.alreadyAuthorized) {
      return { valid: false, reason: 'already_authorized' };
    }
    return {
      valid: true,
      deviceName: request.deviceName,
      expiresAt: request.expiresAt,
    };
  }

  @Post('authorize')
  @UseGuards(JwtAuthGuard)
  async authorizeDevice(
    @Body() body: { user_code: string },
    @GetUser() user: any,
  ) {
    console.log('🔍 Authorize endpoint - user object:', user);
    console.log('🔍 User ID:', user.id, 'Type:', typeof user.id);
    return this.deviceAuthService.authorizeDevice(body.user_code, user.id);
  }

  @Get('devices')
  @UseGuards(JwtAuthGuard)
  async getUserDevices(@GetUser('id') userId: number) {
    return this.deviceAuthService.getUserDevices(userId);
  }

  @Delete('devices/:deviceId')
  @UseGuards(JwtAuthGuard)
  async revokeDevice(
    @Param('deviceId') deviceId: string,
    @GetUser('id') userId: number,
  ) {
    return this.deviceAuthService.revokeDevice(userId, deviceId);
  }

  @Delete('devices')
  @UseGuards(JwtAuthGuard)
  async revokeAllDevices(@GetUser('id') userId: number) {
    return this.deviceAuthService.revokeAllDevices(userId);
  }
}
