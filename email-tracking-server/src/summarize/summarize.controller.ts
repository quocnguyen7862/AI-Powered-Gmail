import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SummarizeService } from './summarize.service';
import { CreateSummarizeDto } from './dto/create-summarize.dto';
import { ReplyGenerateDto } from './dto/reply-generate.dto';
import { SummarizeDraftDto } from './dto/summarize-draft.dto';

@Controller('summarize')
export class SummarizeController {
  constructor(private readonly summarizeService: SummarizeService) {}

  @Post('by-message')
  async summarizeByMessageId(
    @Body() emailData: CreateSummarizeDto,
  ): Promise<string> {
    const result = await this.summarizeService.summarizeByMessageId(emailData);
    return result;
  }

  @Post('by-draft')
  async summarizeByContent(
    @Body() emailData: SummarizeDraftDto,
  ): Promise<string> {
    const result = await this.summarizeService.summarizeByDraftId(emailData);
    return result;
  }

  @Get('reply-scenario')
  async replyScenario(@Query('messageId') messageId: string): Promise<string> {
    const result = await this.summarizeService.replyScenario(messageId);
    return result;
  }

  @Post('reply-generate')
  async replyGenerate(@Body() emailData: ReplyGenerateDto): Promise<string> {
    const result = await this.summarizeService.replyGenerate(emailData);
    return result;
  }
}
