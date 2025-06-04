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
import { Between } from 'typeorm';
import { TrackingGateway } from '@/gateway/tracking.gateway';

@Injectable()
export class TrackingService extends BaseService<TrackingEntity> {
  constructor(
    private readonly trackingRepository: TrackingRepository,
    private readonly readedRepository: ReadedRepository,
    private readonly logger: CustomLoggerService,
    private readonly authService: AuthService,
    private readonly trackingGateway: TrackingGateway,
  ) {
    super(MessageName.TRACKING, trackingRepository);
  }

  async saveSentEmail(dto: CreateTrackingDto): Promise<any> {
    const user = await this.authService.getUserInfo();
    const tracking = this.trackingRepository.create({
      messageId: dto.messageId,
      threadId: dto.threadId,
      trackingId: dto.trackingId,
      userId: user.id,
      isSent: true,
    });

    return await this.trackingRepository.save(tracking);
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
      this.trackingGateway.notifyEmailRead(email.userId, email.threadId);
    }
  }

  private hashUserAddress(userAddress: string): string {
    return bcrypt.hashSync(userAddress, 10);
  }

  async getTrackingStats(sessionId: string, start: Date, end: Date) {
    const user = await this.authService.findBySessionId(sessionId);

    const sentCount = await this.trackingRepository.count({
      where: {
        userId: user.userId,
        isSent: true,
        createdAt: Between(start, end),
      },
    });

    const openedCount = await this.readedRepository
      .createQueryBuilder('readed')
      .leftJoinAndSelect('readed.tracking', 'tracking')
      .where('tracking.userId = :userId', { userId: user.userId })
      .andWhere('readed.isRead = :isRead', { isRead: true })
      .andWhere('readed.createdAt BETWEEN :start AND :end', { start, end })
      .getCount();

    return { sentCount, openedCount };
  }
}
