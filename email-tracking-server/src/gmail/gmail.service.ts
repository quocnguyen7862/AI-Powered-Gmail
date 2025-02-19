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
    const scopes = ['https://www.googleapis.com/auth/gmail.readonly'];

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

  async listEmails() {
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

    const res = await gmail.users.messages.list({ userId: 'me' });

    return res.data;
  }

  async getMessage(id: string) {
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

    const res = await gmail.users.messages.get({
      userId: 'me',
      id,
      format: 'metadata', // Chỉ lấy metadata
      metadataHeaders: ['X-Google-Read'], // Kiểm tra trạng thái đọc
    });

    const labelIds = res.data.labelIds;

    const unreadHeader = labelIds.find((label) => label === 'UNREAD');
    if (!unreadHeader) {
      console.log('Email đã được đọc');
    } else {
      console.log('Email chưa được đọc');
    }

    return res.data;
  }
}
