import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomLoggerService } from '@logger/logger.service';
import { GmailService } from '@/gmail/gmail.service';
import { BaseService } from '@/common/base/base.service';
import { TrackingEntity } from './entities/tracking.entity';
import { MessageName } from '@enums/message';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TrackingService extends BaseService<TrackingEntity> {
  constructor(
    @InjectRepository(TrackingEntity)
    private readonly trackingRepository: Repository<TrackingEntity>,
    private readonly logger: CustomLoggerService,
    private readonly gmailService: GmailService,
  ) {
    super(MessageName.TRACKING, trackingRepository);
  }

  async saveSentEmail(
    userId: string,
    emailId: string,
    to: string,
    subject: string,
    trackingId: string,
  ): Promise<void> {
    const tracking = this.trackingRepository.create({
      emailId,
      trackingId,
      userId,
      isRead: false,
      isSent: true,
    });
    await this.trackingRepository.save(tracking);
  }

  async getSentEmailStatus(emailId: string, userId: string): Promise<boolean> {
    const email = await this.trackingRepository.findOne({
      where: { emailId, userId, isSent: true },
    });
    if (!email) {
      throw new NotFoundException(
        `Sent email with ID ${emailId} not found for user ${userId}`,
      );
    }
    return email.isRead;
  }

  async trackEmailOpen(trackingId: string): Promise<void> {
    const email = await this.trackingRepository.findOne({
      where: { trackingId: trackingId, isSent: true },
    });
    if (email && !email.isRead) {
      email.isRead = true;
      await this.trackingRepository.save(email);
    }
  }
}
