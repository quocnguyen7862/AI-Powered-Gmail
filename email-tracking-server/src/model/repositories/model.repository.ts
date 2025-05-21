import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ModelEntity } from '../entities/model.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ModelRepository extends Repository<ModelEntity> {
  constructor(
    @InjectRepository(ModelEntity)
    private readonly repository: Repository<ModelEntity>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }
}
