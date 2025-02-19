import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TrackingModule } from './tracking/tracking.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './common/database/database.module';
import { GmailService } from './gmail/gmail.service';
import { GmailModule } from './gmail/gmail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TrackingModule,
    DatabaseModule,
    GmailModule,
  ],
  controllers: [AppController],
  providers: [AppService, GmailService],
})
export class AppModule {}
