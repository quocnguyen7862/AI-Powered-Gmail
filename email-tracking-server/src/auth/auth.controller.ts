import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { Auth } from '@/common/decorators/auth.decorator';
import { User } from '@/common/decorators/user.decorator';
import { CreateSessionDto } from './dto/create-session.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  async googleAuth(@Body() payload: { email: string }) {
    const authUrl = await this.authService.getAuthUrl(payload.email);
    return authUrl;
  }

  @Get('google/callback')
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const { code } = req.query;
    const tokensInfo = await this.authService.exchangeGoogleCodeForToken(
      code as string,
    );
    await this.authService.createSession(tokensInfo);

    return res.redirect(
      `https://mail.google.com/mail/u/?authuser=${encodeURIComponent(tokensInfo.email)}`,
    );
  }

  @Post('session')
  async createSession(@Body() payload: CreateSessionDto) {
    const authUrl = await this.authService.createSession(payload);
    return authUrl;
  }

  @Get('email-status')
  async getEmailStatus(
    @Query('emailId') emailId: string,
  ): Promise<{ isRead: boolean }> {
    const isRead = await this.authService.getEmailStatus('me', emailId);
    return { isRead };
  }

  @Get('list-emails')
  async listEmails(): Promise<any[]> {
    return this.authService.listEmails('me');
  }

  @Get('get-email')
  async getEmail(@Query('emailId') emailId: string): Promise<any> {
    return this.authService.getEmail('me', emailId);
  }

  @Get('mark-as-read')
  async markEmailAsRead(@Query('emailId') emailId: string): Promise<string> {
    await this.authService.markEmailAsRead('me', emailId);
    return 'Email marked as read';
  }

  @Get('user-info')
  async getUserInfo(): Promise<any> {
    const data = await this.authService.getUserInfo();
    return data;
  }

  @Get('check')
  async checkAuthenticated(@Query('email') email: string): Promise<any> {
    return this.authService.checkAuthenticated(email);
  }

  @Post('logout')
  @Auth()
  async logout(@User() user): Promise<any> {
    return this.authService.logout(user.sessionId);
  }
}
