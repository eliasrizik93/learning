import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { createParamDecorator } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    @Inject(forwardRef(() => DatabaseService))
    private readonly databaseService: DatabaseService,
  ) {
    super();
  }

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

    // Try JWT first via parent class
    try {
      const result = await super.canActivate(context);
      if (result) {
        return true;
      }
    } catch {
      // JWT failed, try device token
    }

    // Try device token
    const deviceToken = await (this.databaseService as any).deviceToken.findUnique({
      where: { accessToken: token },
      include: { user: true },
    });

    if (deviceToken && !deviceToken.revoked) {
      if (!deviceToken.expiresAt || new Date() <= deviceToken.expiresAt) {
        // Update last used
        await (this.databaseService as any).deviceToken.update({
          where: { id: deviceToken.id },
          data: { lastUsedAt: new Date() },
        });

        request.user = {
          id: deviceToken.user.id,
          email: deviceToken.user.email,
          name: deviceToken.user.name,
        };
        return true;
      }
    }

    throw new UnauthorizedException('Invalid token');
  }
}

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new Error('User not found in request');
    }

    return data ? user[data] : user;
  },
);
