import { Module } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { TrackingController } from './tracking.controller';
import { GmailModule } from '@/gmail/gmail.module';
import { CustomLoggerModule } from '@logger/logger.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackingEntity } from './entities/tracking.entity';
import { ReceiverEntity } from './entities/receiver.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrackingEntity, ReceiverEntity]),
    GmailModule,
    CustomLoggerModule,
  ],
  controllers: [TrackingController],
  providers: [TrackingService],
})
export class TrackingModule {}
