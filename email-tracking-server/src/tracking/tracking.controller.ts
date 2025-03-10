import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { TrackingService } from './tracking.service';

@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Post('save-sent')
  async saveSentEmail(
    @Body('userId') userId: string,
    @Body('emailId') emailId: string,
    @Body('to') to: string,
    @Body('subject') subject: string,
    @Body('trackingId') trackingId: string,
  ) {
    await this.trackingService.saveSentEmail(
      userId,
      emailId,
      to,
      subject,
      trackingId,
    );
    return 'Email saved';
  }

  @Get('sent/:id/status')
  async getSentEmailStatus(
    @Param('id') emailId: string,
    @Query('userId') userId: string,
  ) {
    const isRead = await this.trackingService.getSentEmailStatus(
      emailId,
      userId,
    );
    return { isRead };
  }

  @Get('/track/:trackingId')
  async trackEmailOpen(@Param('trackingId') trackingId: string) {
    await this.trackingService.trackEmailOpen(trackingId);
    // Trả về pixel 1x1 (có thể dùng Buffer để trả về hình ảnh thực tế nếu cần)
  }
}
