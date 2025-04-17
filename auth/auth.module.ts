import { OAuth2Client } from 'google-auth-library';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
} from '@environments';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: 'OAUTH2_CLIENT',
      useValue: new OAuth2Client({
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        redirectUri: GOOGLE_REDIRECT_URI,
      }),
    },
  ],
})
export class AuthModule {}
