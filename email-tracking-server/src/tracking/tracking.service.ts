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
import { ReceiverEntity } from './entities/receiver.entity';

@Injectable()
export class TrackingService extends BaseService<TrackingEntity> {
  constructor(
    @InjectRepository(TrackingEntity)
    private readonly trackingRepository: Repository<TrackingEntity>,
    @InjectRepository(ReceiverEntity)
    private readonly receiverRepository: Repository<ReceiverEntity>,
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
    const data = await this.trackingRepository.save(tracking);

    await Promise.all(
      dto.receiverAddress.map(async (address) => {
        const receiver = this.receiverRepository.create({
          receiverAddress: address,
          threadId: data.threadId,
          isRead: false,
        });
        return await this.receiverRepository.save(receiver);
      }),
    );
  }

  async getSentEmailStatus(
    emailId: string,
    userId: string,
    receiver: string,
  ): Promise<boolean> {
    const email = await this.receiverRepository.findOne({
      where: {
        receiverAddress: receiver,
        threadId: emailId,
        tracking: { isSent: true, userId: userId },
      },
    });
    if (!email) {
      throw new NotFoundException(
        `Sent email with ID ${emailId} not found for user ${userId}`,
      );
    }
    return email.isRead;
  }

  async trackEmailOpen(trackingId: string): Promise<void> {
    const email = await this.receiverRepository.findOne({
      where: {
        tracking: { isSent: true, trackingId: trackingId },
      },
    });
    if (email && !email.isRead) {
      email.isRead = true;
      await this.receiverRepository.save(email);
    }
  }

  private hashUserAddress(userAddress: string): string {
    return bcrypt.hashSync(userAddress, 10);
  }
}
