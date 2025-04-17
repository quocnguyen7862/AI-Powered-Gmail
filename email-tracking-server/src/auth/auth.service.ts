import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Credentials, OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { UserEntity } from './entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { BaseService } from '@/common/base/base.service';
import { MessageName } from '@enums/message';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class AuthService extends BaseService<UserEntity> {
  constructor(
    @Inject('OAUTH2_CLIENT')
    private readonly oauth2Client: OAuth2Client,
    private userRepo: UserRepository,
  ) {
    super(MessageName.USER, userRepo);
  }

  async exchangeGoogleCodeForToken(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: userInfo,
    };
  }

  async createSession(
    user: any,
    access_token: string,
    refresh_token: string,
  ): Promise<string> {
    const sessionId = uuidv4(); // Generate a unique session ID

    const userData = this.userRepo.create({
      sessionId: sessionId,
      userId: user.id,
      email: user.email,
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Set expiration time to 1 hour from now
    });

    await this.userRepo.save(userData);
    return sessionId;
  }

  async validateSession(sessionId: string): Promise<any> {
    const session = await this.userRepo.findOne({ where: { sessionId } });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expired or not found');
    }

    return { userId: session.userId };
  }

  async getAuthUrl(): Promise<string> {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/userinfo.email',
    ];

    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });

    return url;
  }

  async getUserInfo(): Promise<{ id: string; email: string }> {
    const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
    const res = await oauth2.userinfo.get();
    return {
      id: res.data.id,
      email: res.data.email,
    };
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

  async getEmail(userId: string, emailId: string): Promise<any> {
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

    const res = await gmail.users.messages.get({
      userId: userId,
      id: emailId,
    });

    return {
      id: res.data.id,
      Subject: res.data.payload.headers.find(
        (header) => header.name === 'Subject',
      ).value,
      content: res.data,
      attachments: res.data.payload.parts.filter((part) => part.filename),
    };
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
