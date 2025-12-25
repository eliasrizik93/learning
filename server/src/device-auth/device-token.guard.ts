import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { DeviceAuthService } from './device-auth.service';

@Injectable()
export class DeviceTokenGuard implements CanActivate {
  constructor(private readonly deviceAuthService: DeviceAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    const user = await this.deviceAuthService.validateDeviceToken(token);

    if (!user) {
      throw new UnauthorizedException('Invalid or expired device token');
    }

    request.user = user;
    return true;
  }
}
