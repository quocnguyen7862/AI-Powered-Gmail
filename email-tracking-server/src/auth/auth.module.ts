import { OAuth2Client } from 'google-auth-library';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
} from '@environments';
import { UserRepository } from './repositories/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRepository,
    {
      provide: 'OAUTH2_CLIENT',
      useFactory: () => {
        return new OAuth2Client({
          clientId: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
          redirectUri: GOOGLE_REDIRECT_URI,
        });
      },
    },
  ],
  exports: [AuthService, UserRepository, 'OAUTH2_CLIENT'],
})
export class AuthModule {}
