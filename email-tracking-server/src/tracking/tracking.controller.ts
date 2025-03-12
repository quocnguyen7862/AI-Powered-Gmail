import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { Response } from 'express';

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
  async trackEmailOpen(
    @Param('trackingId') trackingId: string,
    @Res() res: Response,
  ) {
    await this.trackingService.trackEmailOpen(trackingId);
    // Trả về pixel 1x1 (có thể dùng Buffer để trả về hình ảnh thực tế nếu cần)

    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
      'base64',
    );
    res.set('Content-Type', 'image/gif');
    res.send(pixel);
  }
}
