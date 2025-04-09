import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';
import { CreateSummarizeDto } from './dto/create-summarize.dto';

@Injectable()
export class SummarizeService {
  private readonly modelUrl =
    'http://localhost:5678/webhook-test/summarize-email';

  async sendEmailToModel(emailData: CreateSummarizeDto): Promise<any> {
    try {
      const response = await axios.post(this.modelUrl, emailData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
