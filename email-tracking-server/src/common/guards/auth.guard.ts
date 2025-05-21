import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const sessionId = req['user']?.sessionId;
    if (!sessionId) throw new UnauthorizedException('No Session');
    const user = await this.authService.validateSession(sessionId);
    if (!user) throw new UnauthorizedException('Invalid Session');
    req['user'] = user;
    return true;
  }
}
