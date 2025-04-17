import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private authService: AuthService) {}

  async use(req: any, res: any, next: (error?: Error | any) => void) {
    const sessionId = req.cookies['sessionId'];

    if (!sessionId) throw new UnauthorizedException('No session');
    const user = await this.authService.validateSession(sessionId);
    if (!user) throw new UnauthorizedException('Invalid session');
    req['user'] = user;
    next();
  }
}
