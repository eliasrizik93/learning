import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { randomBytes } from 'crypto';

@Injectable()
export class DeviceAuthService {
  constructor(private readonly databaseService: DatabaseService) {}

  private generateCode(length: number): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    const bytes = randomBytes(length);
    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length];
    }
    return result;
  }

  async createDeviceAuthRequest(deviceName?: string) {
    const deviceCode = randomBytes(32).toString('hex');
    const userCode = this.generateCode(8);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const request = await (this.databaseService as any).deviceAuthRequest.create({
      data: {
        deviceCode,
        userCode,
        deviceName: deviceName || 'Python CLI',
        expiresAt,
      },
    });

    return {
      device_code: request.deviceCode,
      user_code: request.userCode,
      verification_uri: `http://localhost:5173/authorize/${request.userCode}`,
      expires_in: 900,
      interval: 5,
    };
  }

  async pollForToken(deviceCode: string) {
    const request = await (this.databaseService as any).deviceAuthRequest.findUnique({
      where: { deviceCode },
    });

    if (!request) {
      return { error: 'invalid_request' };
    }

    if (new Date() > request.expiresAt) {
      return { error: 'expired_token' };
    }

    if (!request.authorizedAt) {
      return { error: 'authorization_pending' };
    }

    if (!request.accessToken) {
      return { error: 'authorization_pending' };
    }

    return {
      access_token: request.accessToken,
      token_type: 'bearer',
    };
  }

  async getAuthRequestByUserCode(userCode: string) {
    const request = await (this.databaseService as any).deviceAuthRequest.findUnique({
      where: { userCode },
    });

    if (!request) {
      return null;
    }

    if (new Date() > request.expiresAt) {
      return null;
    }

    if (request.authorizedAt) {
      return { ...request, alreadyAuthorized: true };
    }

    return request;
  }

  async authorizeDevice(userCode: string, userId: number) {
    try {
      console.log('🔐 Authorizing device - userCode:', userCode, 'userId:', userId, 'Type:', typeof userId);
      
      // Verify user exists
      const userExists = await (this.databaseService as any).user.findUnique({
        where: { id: userId },
      });
      console.log('👤 User exists:', userExists ? 'yes' : 'no', userExists?.email);
      
      const request = await (this.databaseService as any).deviceAuthRequest.findUnique({
        where: { userCode },
      });

      console.log('📋 Found request:', request ? 'yes' : 'no');

      if (!request) {
        throw new NotFoundException('Invalid user code');
      }

      if (new Date() > request.expiresAt) {
        throw new NotFoundException('Code expired');
      }

      if (request.authorizedAt) {
        throw new NotFoundException('Already authorized');
      }

      const accessToken = randomBytes(32).toString('hex');
      console.log('🔑 Generated access token');

      await (this.databaseService as any).deviceToken.create({
        data: {
          userId,
          deviceName: request.deviceName,
          accessToken,
        },
      });
      console.log('✅ Created device token');

      await (this.databaseService as any).deviceAuthRequest.update({
        where: { userCode },
        data: {
          authorizedAt: new Date(),
          userId,
          accessToken,
        },
      });
      console.log('✅ Updated auth request');

      return { success: true };
    } catch (error) {
      console.error('❌ Authorization error:', error);
      throw error;
    }
  }

  async getUserDevices(userId: number) {
    const devices = await (this.databaseService as any).deviceToken.findMany({
      where: {
        userId,
        revoked: false,
      },
      select: {
        id: true,
        deviceName: true,
        createdAt: true,
        lastUsedAt: true,
      },
      orderBy: {
        lastUsedAt: 'desc',
      },
    });

    return devices;
  }

  async revokeDevice(userId: number, deviceId: string) {
    const device = await (this.databaseService as any).deviceToken.findFirst({
      where: {
        id: deviceId,
        userId,
      },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    await (this.databaseService as any).deviceToken.update({
      where: { id: deviceId },
      data: { revoked: true },
    });

    return { success: true };
  }

  async revokeAllDevices(userId: number) {
    await (this.databaseService as any).deviceToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });

    return { success: true };
  }

  async validateDeviceToken(token: string) {
    const deviceToken = await (this.databaseService as any).deviceToken.findUnique({
      where: { accessToken: token },
      include: { user: true },
    });

    if (!deviceToken || deviceToken.revoked) {
      return null;
    }

    if (deviceToken.expiresAt && new Date() > deviceToken.expiresAt) {
      return null;
    }

    await (this.databaseService as any).deviceToken.update({
      where: { id: deviceToken.id },
      data: { lastUsedAt: new Date() },
    });

    return deviceToken.user;
  }
}
