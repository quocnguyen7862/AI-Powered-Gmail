import { Inject, Injectable, NotFoundException } from '@nestjs/common';
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
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

@Injectable()
export class TrackingService extends BaseService<TrackingEntity> {
  constructor(
    private readonly trackingRepository: TrackingRepository,
    private readonly readedRepository: ReadedRepository,
    private readonly logger: CustomLoggerService,
    private readonly authService: AuthService,
    private readonly trackingGateway: TrackingGateway,
    @Inject('OAUTH2_CLIENT')
    private readonly oauth2Client: OAuth2Client,
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
      relations: ['user'],
    });
    if (email) {
      const readed = this.readedRepository.create({
        trackingId: email.trackingId,
        isRead: true,
      });
      await this.readedRepository.save(readed);

      try {
        this.oauth2Client.setCredentials({
          access_token: email.user.accessToken,
        });
        const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

        const message = await gmail.users.messages.get({
          userId: 'me',
          id: email.messageId,
          format: 'metadata',
        });
        this.trackingGateway.notifyEmailRead(
          email.userId,
          email.user.email,
          message.data.payload.headers.find(
            (header) => header.name === 'Subject',
          )?.value || '',
        );
      } catch (error) {
        this.logger.error(
          `Error tracking email open for user ${email.userId}: ${error.message}`,
          error.stack,
        );
      }
    }
  }

  private hashUserAddress(userAddress: string): string {
    return bcrypt.hashSync(userAddress, 10);
  }

  async getTrackingStats(sessionId: string, start: Date, end: Date) {
    const user = await this.authService.findBySessionId(sessionId);

    const endPlusOne = new Date(end);
    endPlusOne.setDate(endPlusOne.getDate() + 1);

    const sentCount = await this.trackingRepository.count({
      where: {
        userId: user.userId,
        isSent: true,
        createdAt: Between(start, endPlusOne),
      },
    });

    const openedCount = await this.readedRepository
      .createQueryBuilder('readed')
      .leftJoinAndSelect('readed.tracking', 'tracking')
      .where('tracking.userId = :userId', { userId: user.userId })
      .andWhere('readed.isRead = :isRead', { isRead: true })
      .andWhere('readed.createdAt BETWEEN :start AND :end', {
        start,
        end: endPlusOne,
      })
      .select('COUNT(DISTINCT readed.trackingId)', 'count')
      .getRawOne();

    return { sentCount, openedCount: openedCount?.count || 0 };
  }

  async getTrackingByThreadId(user: any, threadId: string): Promise<any> {
    const emails = await this.trackingRepository.find({
      where: {
        userId: user.id,
        threadId: threadId,
      },
      relations: ['readeds'],
    });

    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

    const trackings = await Promise.all(
      emails.map(async (email) => {
        const messsage = await gmail.users.messages.get({
          userId: 'me',
          id: email.messageId,
          format: 'metadata',
        });

        const subject = messsage.data.payload.headers.find(
          (header) => header.name === 'Subject',
        ).value;

        return {
          ...email,
          subject,
        };
      }),
    );

    return trackings;
  }
}
