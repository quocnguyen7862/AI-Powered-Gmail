import { Module } from '@nestjs/common';
import { ModelService } from './model.service';
import { ModelController } from './model.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelEntity } from './entities/model.entity';
import { ModelRepository } from './repositories/model.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ModelEntity])],
  controllers: [ModelController],
  providers: [ModelService, ModelRepository],
  exports: [ModelService],
})
export class ModelModule {}
