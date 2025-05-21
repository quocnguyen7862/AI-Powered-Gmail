import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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

@Controller('summarize')
export class SummarizeController {
  constructor(private readonly summarizeService: SummarizeService) {}

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
  async getChatHistory(
    @Param('draftId') draftId: string,
    @Query() filter: BaseFilterDto<MessageEntity>,
  ): Promise<any> {
    const result = await this.summarizeService.getChatHistory(draftId, filter);
    return result;
  }

  @Delete('chat-history/:draftId')
  async deleteChatHistory(@Param('draftId') draftId: string): Promise<any> {
    const result = await this.summarizeService.deleteChatHistory(draftId);
    return result;
  }

  @Post('chatbot')
  @Auth()
  async chatbot(@User() user: any, @Body() message: ChatbotDto): Promise<any> {
    const result = await this.summarizeService.chatbot(user, message.message);
    return result;
  }

  @Post('search')
  @Auth()
  async search(@User() user: any, @Body() message: ChatbotDto): Promise<any> {
    const result = await this.summarizeService.search(user, message.message);
    return result;
  }
}
