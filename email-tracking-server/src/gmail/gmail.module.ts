import { OAuth2Client } from 'google-auth-library';
import { Module } from '@nestjs/common';
import { GmailService } from './gmail.service';
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
} from '@environments';
import { GmailController } from './gmail.controller';

@Module({
  providers: [
    {
      provide: 'OAUTH2_CLIENT',
      useValue: new OAuth2Client({
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        redirectUri: GOOGLE_REDIRECT_URI,
      }),
    },
    GmailService,
  ],
  exports: [GmailService, 'OAUTH2_CLIENT'],
  controllers: [GmailController],
})
export class GmailModule {}
