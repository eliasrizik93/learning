import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DeviceAuthService } from './device-auth.service';

@Injectable()
export class CombinedAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly deviceAuthService: DeviceAuthService,
  ) {}

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

    // Try JWT first
    try {
      const payload = this.jwtService.verify(token);
      request.user = {
        id: Number(payload.sub),
        email: payload.email,
        name: payload.name,
      };
      return true;
    } catch {
      // JWT failed, try device token
    }

    // Try device token
    const user = await this.deviceAuthService.validateDeviceToken(token);
    if (user) {
      request.user = user;
      return true;
    }

    throw new UnauthorizedException('Invalid token');
  }
}
