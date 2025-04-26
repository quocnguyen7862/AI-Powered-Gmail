import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';
import { CreateSummarizeDto } from './dto/create-summarize.dto';
import { ContentDto } from './dto/content.dto';
import { ReplyGenerateDto } from './dto/reply-generate.dto';

@Injectable()
export class SummarizeService {
  private readonly modelUrl = 'http://localhost:5678/webhook/';

  async summarizeByMessageId(emailData: CreateSummarizeDto): Promise<any> {
    try {
      const response = await axios.post(
        this.modelUrl + 'summarize-email',
        emailData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async summarizeByContent(emailData: ContentDto): Promise<any> {
    try {
      const response = await axios.post(
        this.modelUrl + 'summary-content',
        emailData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async replyScenario(messageId: string): Promise<any> {
    try {
      const response = await axios.get(
        this.modelUrl + 'reply-scenario?messageId=' + messageId,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async replyGenerate(emailData: ReplyGenerateDto): Promise<any> {
    try {
      const response = await axios.post(
        this.modelUrl + 'reply-generate',
        emailData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
