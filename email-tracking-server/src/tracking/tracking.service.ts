import { Injectable } from '@nestjs/common';
import { CustomLoggerService } from '@logger/logger.service';
import { GmailService } from '@/gmail/gmail.service';

@Injectable()
export class TrackingService {
  constructor(
    private readonly logger: CustomLoggerService,
    private readonly gmailService: GmailService,
  ) {}

  async logTrackingEvent(emailId: string): Promise<void> {
    this.logger.log(`Email ID: ${emailId} has been opened.`);
  }

  async logEmailOpen(emailId: string) {
    const emails = await this.gmailService.listEmails();
    const email = emails.messages.find((msg) => msg.id === emailId);

    this.logger.log(`Email opened: ${email.snippet}`);
  }
}
