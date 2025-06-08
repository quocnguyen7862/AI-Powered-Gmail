import { Module } from '@nestjs/common';
import { LabelService } from './label.service';
import { LabelController } from './label.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabelEntity } from './entities/label.entity';
import { LabelRepository } from './repositories/label.repository';
import { ModelModule } from '@/model/model.module';
import { ClassifyEntity } from './entities/classify.entity';
import { ClassifyRepository } from './repositories/classify.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([LabelEntity, ClassifyEntity]),
    ModelModule,
  ],
  controllers: [LabelController],
  providers: [LabelService, LabelRepository, ClassifyRepository],
  exports: [LabelService],
})
export class LabelModule {}
