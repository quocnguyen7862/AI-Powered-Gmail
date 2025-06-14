import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseService } from '@/common/base/base.service';
import { LabelEntity } from './entities/label.entity';
import { LabelRepository } from './repositories/label.repository';
import { MessageName } from '@enums/message';
import axios from 'axios';
import { MODEL_URL2 } from '@environments';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';
import { RemoveResult } from '@/common/types/remove-result';
import { NotFoundException } from '@exceptions/not-found.exception';
import { OAuth2Client } from 'google-auth-library';
import { ModelService } from '@/model/model.service';
import { ClassifyRepository } from './repositories/classify.repository';

@Injectable()
export class LabelService extends BaseService<LabelEntity> {
  constructor(
    private readonly labelRepo: LabelRepository,
    @Inject('OAUTH2_CLIENT')
    private readonly oauth2Client: OAuth2Client,
    private readonly modelService: ModelService,
    private readonly classifyRepo: ClassifyRepository,
  ) {
    super(MessageName.LABEL, labelRepo);
  }

  async embeddingLabel(
    label: string,
    desc: string,
    user_id: string,
  ): Promise<any> {
    try {
      const response = await axios.post(
        MODEL_URL2 + 'label/embed-label',
        {
          label: label,
          description: desc,
          user_id: user_id,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to embed label: ${error.message}`);
    }
  }

  async classifyLabel(messageId: string, user: any, summary: string) {
    try {
      const labels = await this.findMyAll(user.id);
      const labelNames = labels.map(
        (label) => `${label.name}:${label.description}`,
      );

      const model = await this.modelService.getSelectedByUserId(user.id);

      const response = await axios.post(
        MODEL_URL2 + 'label/classify-email',
        {
          user_id: user.id,
          labels: labelNames,
          summary: summary,
          model: model.model,
          provider: model.modelProvider,
          api_key: model.apiKey,
          api_key_type: model.apiKeyType,
          user_name: user.name,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Classify response:', response.data.label, messageId);

      const labelId = await this.labelRepo.findOne({
        where: { name: response.data.label, userId: user.id, deletedAt: null },
        select: {
          id: true,
        },
      });

      if (labelId) {
        const classifiedLabels = this.classifyRepo.create({
          messageId: messageId,
          labelId: labelId.id,
        });

        await this.classifyRepo.upsert(classifiedLabels, {
          conflictPaths: ['messageId'],
          skipUpdateIfNoValuesChanged: true,
        });
      }

      return { ...response.data };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async createMyLabel(
    dto: CreateLabelDto,
    userId: string,
  ): Promise<LabelEntity> {
    // await this.embeddingLabel(dto.name, dto.description, userId);
    const entity = this.labelRepo.create({
      name: dto.name,
      description: dto.description,
      color: dto.color,
      userId: userId,
    });

    // const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

    // await gmail.users.labels.create({
    //   userId: 'me',
    //   requestBody: {
    //     name: dto.name,
    //     labelListVisibility: 'labelShow',
    //     messageListVisibility: 'show',
    //     color: {
    //       backgroundColor: dto.color,
    //     },
    //   },
    // });

    return await this.labelRepo.save(entity);
  }

  async updateMyLabel(
    id: number,
    dto: UpdateLabelDto,
    userId: string,
  ): Promise<LabelEntity> {
    const entity = await this.labelRepo.findOne({
      where: { id: id, userId: userId },
    });

    if (!entity) {
      throw new Error('Label not found');
    }

    entity.name = dto.name;
    entity.description = dto.description;
    entity.color = dto.color;

    return await this.labelRepo.save(entity);
  }

  async removeMyLabel(id: number, userId: string): Promise<RemoveResult> {
    const toRemove = await this.labelRepo.findOne({
      where: { id: id, userId: userId },
    });

    if (!toRemove) {
      throw new NotFoundException(MessageName.LABEL);
    }

    const removed = await this.labelRepo.delete(toRemove.id);

    // const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

    // await gmail.users.labels.delete({
    //   userId: 'me',
    //   id: toRemove.name, // Assuming the label ID is the same as the name
    // });

    return {
      removed: removed.affected,
    };
  }

  async findMyAll(userId: string): Promise<LabelEntity[]> {
    const labels = await this.labelRepo.find({
      where: { userId: userId, deletedAt: null },
      order: { createdAt: 'DESC' },
      relations: ['classifies'],
    });

    return labels;
  }

  async findMyById(id: number, userId: string): Promise<LabelEntity> {
    const label = await this.labelRepo.findOne({
      where: { id: id, userId: userId, deletedAt: null },
      relations: ['classifies'],
    });

    if (!label) {
      throw new NotFoundException(MessageName.LABEL);
    }

    return label;
  }

  async findByMessageId(messageId: string): Promise<LabelEntity> {
    const classify = await this.classifyRepo.findOne({
      where: { messageId: messageId, deletedAt: null },
      relations: ['label'],
    });

    if (!classify) {
      throw new NotFoundException(MessageName.CLASSIFY);
    }

    return classify.label;
  }
}
