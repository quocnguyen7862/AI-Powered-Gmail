import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Credentials, OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { UserEntity } from './entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { BaseService } from '@/common/base/base.service';
import { MessageName } from '@enums/message';
import { UserRepository } from './repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { JWT_ACCESS_SECRET } from '@environments';
import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class AuthService extends BaseService<UserEntity> {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('OAUTH2_CLIENT')
    private readonly oauth2Client: OAuth2Client,
    private readonly userRepo: UserRepository,
  ) {
    super(MessageName.USER, userRepo);
  }

  async exchangeGoogleCodeForToken(code: string): Promise<CreateSessionDto> {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    return {
      accessToken: tokens.access_token,
      expiryDate: tokens.expiry_date,
      idToken: tokens.id_token,
      refreshToken: tokens.refresh_token,
      refreshTokenExpiresIn: tokens['refresh_token_expires_in'] || 0,
      scope: tokens.scope,
      tokenType: tokens.token_type,
      userId: userInfo.id,
      email: userInfo.email,
    };
  }

  async checkAuthenticated(email: string): Promise<any> {
    try {
      const user = await this.userRepo.findOne({
        where: { email },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      const sesssion = await this.validateSession(user.sessionId);

      const jwt_accessToken = await this.getJwtTokens(
        sesssion.sessionId,
        sesssion.email,
      );

      return { ...user, jwt_accessToken };
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  async createSession(tokenInfo: CreateSessionDto): Promise<string> {
    const sessionId = uuidv4(); // Generate a unique session ID

    const userData = this.userRepo.create({
      sessionId: sessionId,
      userId: tokenInfo.userId,
      email: tokenInfo.email,
      accessToken: tokenInfo.accessToken,
      expiresAt: new Date(tokenInfo.expiryDate),
      idToken: tokenInfo.idToken,
      refreshToken: tokenInfo.refreshToken,
      refreshTokenExpiresIn: new Date(tokenInfo.refreshTokenExpiresIn),
      scope: tokenInfo.scope,
      tokenType: tokenInfo.tokenType,
    });

    await this.userRepo.upsert(userData, {
      conflictPaths: ['userId', 'email'],
      skipUpdateIfNoValuesChanged: true,
    });
    return sessionId;
  }

  async validateSession(sessionId: string): Promise<any> {
    const session = await this.userRepo.findOne({ where: { sessionId } });

    if (!session || !session.accessToken) {
      throw new UnauthorizedException('Invalid session');
    }

    this.oauth2Client.setCredentials({ access_token: session.accessToken });

    try {
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const { data: userInfo } = await oauth2.userinfo.get();
      return { ...userInfo, sessionId };
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  async getAuthUrl(email?: string): Promise<string> {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ];

    const existEmail = await this.findByEmail(email);

    const params: any = {
      access_type: 'offline',
      scope: scopes,
      prompt: existEmail ? 'none' : 'consent', // Không hiện popup xác nhận lại nếu đã đăng nhập
    };

    if (email && existEmail) {
      params.login_hint = email; // Gợi ý email để người dùng không phải nhập lại
    }

    const url = this.oauth2Client.generateAuthUrl(params);
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

  async logout(sessionId: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { sessionId } });

    if (!user) {
      throw new UnauthorizedException('Session not found');
    }

    user.accessToken = null;
    user.refreshToken = null;
    user.expiresAt = null;
    user.sessionId = null;
    await this.userRepo.save(user);
  }

  async getJwtTokens(sessionId: string, email: string) {
    const accessToken = await this.jwtService.signAsync(
      {
        sessionId,
        email,
      },
      {
        secret: JWT_ACCESS_SECRET,
      },
    );
    return accessToken;
  }

  async findBySessionId(id: string): Promise<UserEntity> {
    const entity = await this.userRepo.findOneBy({
      sessionId: id,
      deletedAt: null,
    });
    if (!entity) {
      throw new NotFoundException(MessageName.USER);
    }
    return entity;
  }

  async findByEmail(email: string): Promise<UserEntity> {
    const entity = await this.userRepo.findOneBy({
      email,
      deletedAt: null,
    });
    return entity;
  }
}
