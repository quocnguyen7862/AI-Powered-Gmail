import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SummarizeService } from './summarize.service';
import { CreateSummarizeDto } from './dto/create-summarize.dto';
import { ContentDto } from './dto/content.dto';
import { ReplyGenerateDto } from './dto/reply-generate.dto';

@Controller('summarize')
export class SummarizeController {
  constructor(private readonly summarizeService: SummarizeService) {}

  @Post()
  async summarizeByMessageId(
    @Body() emailData: CreateSummarizeDto,
  ): Promise<string> {
    const result = await this.summarizeService.summarizeByMessageId(emailData);
    return result;
  }

  @Post('content')
  async summarizeByContent(@Body() emailData: ContentDto): Promise<string> {
    const result = await this.summarizeService.summarizeByContent(emailData);
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
