import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { SummarizeService } from './summarize.service';
import { ReplyGenerateDto } from './dto/reply-generate.dto';
import { SummarizeDraftDto } from './dto/summarize-draft.dto';
import { BaseFilterDto } from '@/common/base/base-filter.dto';
import { MessageEntity } from './entities/message.entity';
import { EmailMessageDto } from './dto/email-message.dto';
import { Auth } from '@/common/decorators/auth.decorator';
import { User } from '@/common/decorators/user.decorator';
import { ChatbotDto } from './dto/chatbot-message.dto';
import { SummarizeEntity } from './entities/summarize.entity';

@Controller('summarize')
export class SummarizeController {
  constructor(private readonly summarizeService: SummarizeService) {}

  @Get()
  @Auth()
  async getSummaries(
    @User() user: any,
    @Query() filter: BaseFilterDto<SummarizeEntity>,
  ): Promise<any> {
    const result = await this.summarizeService.getSummarizeByUserId(
      user,
      filter,
    );
    return result;
  }

  @Post('regenerate')
  @Auth()
  async reSummarize(
    @Body() emailData: EmailMessageDto,
    @User() user: any,
  ): Promise<string> {
    const result = await this.summarizeService.reSummarizeByMessageId(
      emailData,
      user,
    );
    return result;
  }

  @Post('by-message')
  @Auth()
  async summarizeByMessageId(
    @Body() emailData: EmailMessageDto,
    @User() user: any,
  ): Promise<string> {
    const result = await this.summarizeService.summarizeByMessageId(
      emailData,
      user,
    );
    return result;
  }

  @Post('by-draft')
  @Auth()
  async summarizeByContent(
    @Body() emailData: SummarizeDraftDto,
    @User() user: any,
  ): Promise<string> {
    const result = await this.summarizeService.summarizeByDraftId(
      emailData,
      user,
    );
    return result;
  }

  @Get('reply-scenario')
  @Auth()
  async replyScenario(
    @Query('messageId') messageId: string,
    @User() user: any,
  ): Promise<string> {
    const result = await this.summarizeService.replyScenario(messageId, user);
    return result;
  }

  @Post('reply-generate')
  @Auth()
  async replyGenerate(
    @Body() emailData: ReplyGenerateDto,
    @User() user: any,
  ): Promise<string> {
    const result = await this.summarizeService.replyGenerate(emailData, user);
    return result;
  }

  @Get('chat-history/:draftId')
  @Auth()
  async getChatHistory(
    @User() user: any,
    @Param('draftId') draftId: string,
    @Query() filter: BaseFilterDto<MessageEntity>,
    @Query('isChatbot') isChatbot?: boolean,
  ): Promise<any> {
    const result = await this.summarizeService.getChatHistory(
      draftId,
      isChatbot,
      user,
      filter,
    );
    return result;
  }

  @Get('thread-history')
  @Auth()
  async getThreadHistory(@User() user: any): Promise<any> {
    const result = await this.summarizeService.getThreadHistory(user);
    return result;
  }

  @Delete('chat-history/:draftId')
  @Auth()
  async deleteChatHistory(
    @User() user: any,
    @Param('draftId') draftId: string,
    @Query('isChatbot') isChatbot?: boolean,
  ): Promise<any> {
    const result = await this.summarizeService.deleteChatHistory(
      draftId,
      isChatbot,
      user,
    );
    return result;
  }

  @Post('chatbot')
  @Auth()
  async chatbot(@User() user: any, @Body() message: ChatbotDto): Promise<any> {
    const result = await this.summarizeService.chatbot(user, message);
    return result;
  }

  @Post('search')
  @Auth()
  async search(@User() user: any, @Body() message: ChatbotDto): Promise<any> {
    const result = await this.summarizeService.search(user, message.message);
    return result;
  }

  @Patch('language/:language')
  @Auth()
  async updateLanguage(
    @User() user: any,
    @Param('language') language: string,
  ): Promise<any> {
    const result = await this.summarizeService.updateLanguage(user, language);
    return result;
  }

  @Post('webhook')
  async handlePubSub(@Body() body: any): Promise<any> {
    const data = Buffer.from(body.message.data, 'base64').toString('utf-8');
    const parsed = JSON.parse(data);

    console.log('📩 Email update from Gmail:', parsed);
    return await this.summarizeService.summarizeByHistoryId(
      parsed.emailAddress,
      parsed.historyId,
    );
  }

  @Delete('history')
  @Auth()
  async deleteHistory(@User() user: any): Promise<any> {
    const result = await this.summarizeService.deleteSummarizeByUserId(user);
    return result;
  }
}
