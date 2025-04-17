import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomLoggerService } from '@logger/logger.service';
import { AuthService } from '@/auth/auth.service';
import { BaseService } from '@/common/base/base.service';
import { TrackingEntity } from './entities/tracking.entity';
import { MessageName } from '@enums/message';
import * as bcrypt from 'bcrypt';
import { CreateTrackingDto } from './dto/create-tracking.dto';
import { TrackingRepository } from './repositories/tracking.repository';
import { ReadedRepository } from './repositories/readed.repository';

@Injectable()
export class TrackingService extends BaseService<TrackingEntity> {
  constructor(
    private readonly trackingRepository: TrackingRepository,
    private readonly readedRepository: ReadedRepository,
    private readonly logger: CustomLoggerService,
    private readonly authService: AuthService,
  ) {
    super(MessageName.TRACKING, trackingRepository);
  }

  async saveSentEmail(dto: CreateTrackingDto): Promise<void> {
    const user = await this.authService.getUserInfo();
    const tracking = this.trackingRepository.create({
      messageId: dto.messageId,
      threadId: dto.threadId,
      trackingId: dto.trackingId,
      userId: user.id,
      isSent: true,
    });

    await this.trackingRepository.save(tracking);
  }

  async getSentEmailStatus(threadId: string): Promise<any> {
    const user = await this.authService.getUserInfo();
    const email = await this.trackingRepository.findOne({
      where: {
        userId: user.id,
        threadId: threadId,
      },
      relations: ['readeds'],
    });
    if (!email) {
      throw new NotFoundException(
        `Sent email with ID ${threadId} not found for user ${user.id}`,
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
