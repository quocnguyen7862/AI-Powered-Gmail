import { Module } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { TrackingController } from './tracking.controller';
import { AuthModule } from '@/auth/auth.module';
import { CustomLoggerModule } from '@logger/logger.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackingEntity } from './entities/tracking.entity';
import { ReadedEntity } from './entities/readed.entity';
import { TrackingRepository } from './repositories/tracking.repository';
import { ReadedRepository } from './repositories/readed.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrackingEntity, ReadedEntity]),
    AuthModule,
    CustomLoggerModule,
  ],
  controllers: [TrackingController],
  providers: [TrackingService, TrackingRepository, ReadedRepository],
})
export class TrackingModule {}
