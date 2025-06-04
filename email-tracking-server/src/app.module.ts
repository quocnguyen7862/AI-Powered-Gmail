import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TrackingModule } from './tracking/tracking.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './common/database/database.module';
import { AuthService } from './auth/auth.service';
import { SummarizeModule } from './summarize/summarize.module';
import { AuthModule } from './auth/auth.module';
import { ModelModule } from './model/model.module';
import { LabelModule } from './label/label.module';
import { TrackingGateway } from './gateway/tracking.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TrackingModule,
    DatabaseModule,
    SummarizeModule,
    AuthModule,
    ModelModule,
    LabelModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthService, TrackingGateway],
})
export class AppModule {}
