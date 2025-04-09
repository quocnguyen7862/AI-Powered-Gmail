import { Body, Controller, Post } from '@nestjs/common';
import { SummarizeService } from './summarize.service';
import { CreateSummarizeDto } from './dto/create-summarize.dto';

@Controller('summarize')
export class SummarizeController {
  constructor(private readonly summarizeService: SummarizeService) {}

  @Post()
  async summarizeEmail(@Body() emailData: CreateSummarizeDto): Promise<string> {
    const result = await this.summarizeService.sendEmailToModel(emailData);
    return result;
  }
}
