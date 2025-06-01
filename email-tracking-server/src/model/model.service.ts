import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { BaseService } from '@/common/base/base.service';
import { ModelEntity } from './entities/model.entity';
import { ModelRepository } from './repositories/model.repository';
import { MessageName } from '@enums/message';
import { CheckModelDto } from './dto/check-model.dto';
import axios from 'axios';
import { MODEL_URL } from '@environments';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateAuthDto } from '@/auth/dto/update-auth.dto';
import { NotFoundException } from '@exceptions/not-found.exception';
import { RemoveResult } from '@/common/types/remove-result';

@Injectable()
export class ModelService extends BaseService<ModelEntity> {
  constructor(private readonly modelRepo: ModelRepository) {
    super(MessageName.MODEL, modelRepo);
  }

  async checkModel(dto: CheckModelDto, user: any): Promise<any> {
    try {
      const reponse = await axios.post(
        MODEL_URL + 'model/check',
        {
          model: dto.model,
          provider: dto.provider,
          api_key: dto.apiKey,
          api_key_type: dto.apiKeyType,
          user_id: user.id,
          user_name: user.name,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      return reponse.data;
    } catch (error) {
      throw new HttpException(
        { message: error.response.data.detail },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async createMyModel(
    createDto: CreateModelDto,
    userId: string,
  ): Promise<ModelEntity> {
    const entity = this.modelRepo.create({
      name: createDto.name,
      userId: userId,
      modelProvider: createDto.provider,
      model: createDto.model,
      apiKey: createDto.apiKey,
      apiKeyType: createDto.apiKeyType,
    });
    return await this.modelRepo.save(entity);
  }

  async updateMyModel(
    id: number,
    updateDto: UpdateAuthDto,
    userId: string,
  ): Promise<ModelEntity> {
    const toUpdate = await this.modelRepo.findOne({
      where: { id, userId, deletedAt: null },
    });
    if (!toUpdate) {
      throw new NotFoundException(MessageName.MODEL);
    }
    const updated = Object.assign(toUpdate, updateDto);
    return this.modelRepo.save(updated);
  }

  async removeMyModel(id: number, userId: any): Promise<RemoveResult> {
    const toRemove = await this.modelRepo.findOne({
      where: { id, userId, deletedAt: null },
    });

    if (!toRemove) {
      throw new NotFoundException(MessageName.MODEL);
    }

    const removed = await this.modelRepo.delete(toRemove.id);
    return {
      removed: removed.affected,
    };
  }

  async activeMyModel(
    id: number,
    userId: any,
    isActive: boolean,
  ): Promise<ModelEntity> {
    await this.modelRepo
      .createQueryBuilder()
      .update()
      .set({ isSelected: false })
      .where('userId = :userId', { userId })
      .andWhere('isSelected = :isSelected', { isSelected: true })
      .andWhere('deletedAt IS NULL')
      .execute();

    const toUpdate = await this.modelRepo.findOne({
      where: { id, userId, deletedAt: null },
    });
    if (!toUpdate) {
      throw new NotFoundException(MessageName.MODEL);
    }
    const updated = Object.assign(toUpdate, { isSelected: isActive });
    return await this.modelRepo.save(updated);
  }

  async getSelectedByUserId(userId: string): Promise<ModelEntity> {
    const entity = await this.modelRepo.findOne({
      where: {
        userId: userId,
        isSelected: true,
      },
    });
    if (!entity) {
      throw new HttpException(
        { message: 'No model has been registered' },
        HttpStatus.NOT_FOUND,
      );
    }
    return entity;
  }

  async findByUserId(userId: string): Promise<ModelEntity[]> {
    const models = await this.modelRepo.find({
      where: {
        userId: userId,
        deletedAt: null,
      },
      order: {
        createdAt: 'ASC',
      },
    });

    return models;
  }
}
