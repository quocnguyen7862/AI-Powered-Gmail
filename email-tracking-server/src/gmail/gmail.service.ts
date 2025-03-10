import { Inject, Injectable } from '@nestjs/common';
import { Credentials, OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

@Injectable()
export class GmailService {
  constructor(
    @Inject('OAUTH2_CLIENT')
    private readonly oauth2Client: OAuth2Client,
  ) {}

  async getAuthUrl(): Promise<string> {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
    ];

    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });

    return url;
  }

  async getTokens(code: string): Promise<Credentials> {
    const { tokens } = await this.oauth2Client.getToken(code);

    this.oauth2Client.setCredentials(tokens);

    return tokens;
  }

  setCredentials(tokens: Credentials): void {
    this.oauth2Client.setCredentials(tokens);
  }

  async getEmailStatus(userId: string, emailId: string): Promise<boolean> {
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    const res = await gmail.users.messages.get({
      userId: 'me',
      id: emailId,
      format: 'metadata',
    });

    const isUnread = res.data.labelIds.includes('UNREAD') || false;
    return !isUnread;
  }

  async listEmails(userId: string, maxResults: number = 10): Promise<any[]> {
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

    const res = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
    });

    return res.data.messages || [];
  }

  async markEmailAsRead(userId: string, emailId: string): Promise<void> {
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    await gmail.users.messages.modify({
      userId: 'me',
      id: emailId,
      requestBody: {
        removeLabelIds: ['UNREAD'],
      },
    });
  }
}
