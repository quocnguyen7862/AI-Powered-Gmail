import { Controller, Get, Query } from '@nestjs/common';
import { TrackingService } from './tracking.service';

@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get('pixel')
  async trackEmail(@Query('emailId') emailId: string) {
    await this.trackingService.logEmailOpen(emailId);

    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgAB/1h1ZAAAAABJRU5ErkJggg==',
      'base64',
    );

    return {
      headers: {
        'Content-Type': 'image/png',
      },
      body: pixel,
    };
  }
}
