import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ReadedEntity } from '../entities/readed.entity';

@Injectable()
export class ReadedRepository extends Repository<ReadedEntity> {
  constructor(
    @InjectRepository(ReadedEntity)
    private readonly repository: Repository<ReadedEntity>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }
}
