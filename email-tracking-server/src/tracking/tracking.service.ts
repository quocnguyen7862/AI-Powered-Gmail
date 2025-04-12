import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomLoggerService } from '@logger/logger.service';
import { GmailService } from '@/gmail/gmail.service';
import { BaseService } from '@/common/base/base.service';
import { TrackingEntity } from './entities/tracking.entity';
import { MessageName } from '@enums/message';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { CreateTrackingDto } from './dto/create-tracking.dto';
import { ReadedEntity } from './entities/readed.entity';

@Injectable()
export class TrackingService extends BaseService<TrackingEntity> {
  constructor(
    @InjectRepository(TrackingEntity)
    private readonly trackingRepository: Repository<TrackingEntity>,
    @InjectRepository(ReadedEntity)
    private readonly readedRepository: Repository<ReadedEntity>,
    private readonly logger: CustomLoggerService,
    private readonly gmailService: GmailService,
  ) {
    super(MessageName.TRACKING, trackingRepository);
  }

  async saveSentEmail(dto: CreateTrackingDto): Promise<void> {
    const user = await this.gmailService.getUserInfo();
    const tracking = this.trackingRepository.create({
      messageId: dto.messageId,
      threadId: dto.threadId,
      trackingId: dto.trackingId,
      userId: user.id,
      isSent: true,
      userAddress: user.email,
    });

    await this.trackingRepository.save(tracking);
  }

  async getSentEmailStatus(emailId: string, userId: string): Promise<any> {
    const email = await this.trackingRepository.findOne({
      where: {
        userId: userId,
        threadId: emailId,
      },
    });
    if (!email) {
      throw new NotFoundException(
        `Sent email with ID ${emailId} not found for user ${userId}`,
      );
    }
    return email;
  }

  async trackEmailOpen(trackingId: string): Promise<void> {
    const email = await this.trackingRepository.findOne({
      where: {
        trackingId: trackingId,
        isSent: true,
      },
    });
    if (email) {
      const readed = this.readedRepository.create({
        trackingId: email.trackingId,
        isRead: true,
      });
      await this.readedRepository.save(readed);
    }
  }

  private hashUserAddress(userAddress: string): string {
    return bcrypt.hashSync(userAddress, 10);
  }
}
