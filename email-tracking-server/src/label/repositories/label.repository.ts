import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LabelEntity } from '../entities/label.entity';

@Injectable()
export class LabelRepository extends Repository<LabelEntity> {
  constructor(
    @InjectRepository(LabelEntity)
    private readonly repository: Repository<LabelEntity>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }
}
