import { Module } from '@nestjs/common';
import { LabelService } from './label.service';
import { LabelController } from './label.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabelEntity } from './entities/label.entity';
import { LabelRepository } from './repositories/label.repository';

@Module({
  imports: [TypeOrmModule.forFeature([LabelEntity])],
  controllers: [LabelController],
  providers: [LabelService, LabelRepository],
  exports: [LabelService],
})
export class LabelModule {}
