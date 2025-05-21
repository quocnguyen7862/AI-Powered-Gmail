import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { BaseService } from '@/common/base/base.service';
import { ModelEntity } from './entities/model.entity';
import { ModelRepository } from './repositories/model.repository';
import { MessageName } from '@enums/message';
import { CheckModelDto } from './dto/check-model.dto';
import axios from 'axios';
import { MODEL_URL } from '@environments';
import { CreateModelDto } from './dto/create-model.dto';

@Injectable()
export class ModelService extends BaseService<ModelEntity> {
  constructor(private readonly modelRepo: ModelRepository) {
    super(MessageName.MODEL, modelRepo);
  }

  async checkModel(dto: CheckModelDto): Promise<any> {
    try {
      const reponse = await axios.post(
        MODEL_URL + 'model/check',
        {
          model: dto.model,
          provider: dto.provider,
          api_key: dto.apiKey,
          api_key_type: dto.apiKeyType,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      return reponse.data;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async createModel(
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

  async getSelectedByUserId(userId: string): Promise<ModelEntity> {
    const entity = await this.modelRepo.findOne({
      where: {
        userId: userId,
        isSelected: true,
      },
    });
    if (!entity) {
      throw new HttpException('Model not found', HttpStatus.NOT_FOUND);
    }
    return entity;
  }
}
