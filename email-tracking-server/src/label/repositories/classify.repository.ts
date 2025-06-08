import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ClassifyEntity } from '../entities/classify.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ClassifyRepository extends Repository<ClassifyEntity> {
  constructor(
    @InjectRepository(ClassifyEntity)
    private readonly repository: Repository<ClassifyEntity>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }
}
