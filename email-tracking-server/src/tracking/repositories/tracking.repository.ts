import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TrackingEntity } from '../entities/tracking.entity';

@Injectable()
export class TrackingRepository extends Repository<TrackingEntity> {
  constructor(
    @InjectRepository(TrackingEntity)
    private readonly repository: Repository<TrackingEntity>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }
}
