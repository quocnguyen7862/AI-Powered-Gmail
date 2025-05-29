import { Inject, Injectable } from '@nestjs/common';
import { BaseService } from '@/common/base/base.service';
import { LabelEntity } from './entities/label.entity';
import { LabelRepository } from './repositories/label.repository';
import { MessageName } from '@enums/message';
import axios from 'axios';
import { MODEL_URL } from '@environments';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';
import { RemoveResult } from '@/common/types/remove-result';
import { NotFoundException } from '@exceptions/not-found.exception';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

@Injectable()
export class LabelService extends BaseService<LabelEntity> {
  constructor(
    private readonly labelRepo: LabelRepository,
    @Inject('OAUTH2_CLIENT')
    private readonly oauth2Client: OAuth2Client,
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
        MODEL_URL + 'label/embed-label',
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

  async createMyLabel(
    dto: CreateLabelDto,
    userId: string,
  ): Promise<LabelEntity> {
    await this.embeddingLabel(dto.name, dto.description, userId);
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
    });

    return labels;
  }
}
