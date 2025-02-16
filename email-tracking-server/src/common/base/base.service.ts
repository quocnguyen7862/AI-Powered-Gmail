import { MessageName } from '@/common/enums/message';
import { NotFoundException } from '@exceptions/not-found.exception';
import { Repository } from 'typeorm';
import { BaseEntity } from './base.entity';
import { BadRequestException } from '@nestjs/common';
import { Pagination } from '../types/pagination';
import { RemoveResult } from '../types/remove-result';

export abstract class BaseService<E extends BaseEntity> {
  constructor(
    private readonly name: string,
    private readonly repository: Repository<E>,
  ) {}

  async findAll(filterDto?: any): Promise<E[] | Pagination<E>> {
    const [data, total] = await this.repository.findAndCount({
      take: filterDto.limit,
      skip: filterDto.skip,
      order: filterDto.order,
      where: {
        deletedAt: null,
      },
    });

    return { data, total };
  }

  async findById(id: number): Promise<E> {
    const entity = await this.repository.findOneBy({
      id,
      deletedAt: null,
    } as any);
    if (!entity) {
      throw new NotFoundException(this.name as MessageName);
    }
    return entity;
  }

  async create(createDto: any): Promise<E> {
    const entity = this.repository.create(createDto as any);
    return this.repository.save(entity as any);
  }

  async remove(id: string | number): Promise<RemoveResult> {
    const toRemove = await this.repository.findOne({
      where: { id, deletedAt: null } as any,
    });

    if (!toRemove) {
      throw new NotFoundException(this.name as MessageName);
    }

    const removed = await this.repository.softDelete(toRemove.id);
    return {
      removed: removed.affected,
    };
  }

  async update(id: string | number, updateDto: any): Promise<E> {
    const toUpdate = await this.repository.findOne({
      where: { id, deletedAt: null } as any,
    });
    if (!toUpdate) {
      throw new NotFoundException(this.name as MessageName);
    }
    const updated = Object.assign(toUpdate, updateDto);
    return this.repository.save(updated);
  }

  async destroy(id: string | number): Promise<RemoveResult> {
    const toDestroy = await this.repository.findOne({
      where: { id } as any,
      withDeleted: true,
    });
    if (!toDestroy) {
      throw new NotFoundException(this.name as MessageName);
    }
    const removed = await this.repository.delete(toDestroy.id);
    return {
      removed: removed.affected,
    };
  }

  async restore(id: number): Promise<{ restored: boolean }> {
    const toRestore = await this.repository.findOne({
      where: { id } as any,
      withDeleted: true,
    });
    if (!toRestore) {
      throw new NotFoundException(this.name as MessageName);
    }

    const restored = await this.repository.restore(id);

    if (restored.affected === 0) {
      throw new BadRequestException(`Failed to restore entity with ID ${id}.`);
    }

    return { restored: true };
  }
}
