import { AuthGuard } from '@/common/guards/auth.guard';
import { applyDecorators, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../guards/access-token.guard';

export function Auth() {
  return applyDecorators(UseGuards(AccessTokenGuard, AuthGuard));
}
