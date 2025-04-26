import { AuthGuard } from '@/common/guards/auth.guard';
import { applyDecorators, UseGuards } from '@nestjs/common';

export function Auth() {
  return applyDecorators(UseGuards(AuthGuard));
}
