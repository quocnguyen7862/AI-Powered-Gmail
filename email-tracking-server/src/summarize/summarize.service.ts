import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import { CreateSummarizeDto } from './dto/create-summarize.dto';
import { ReplyGenerateDto } from './dto/reply-generate.dto';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { SummarizeDraftDto } from './dto/summarize-draft.dto';

@Injectable()
export class SummarizeService {
  private readonly modelUrl = 'http://localhost:5678/webhook/';

  constructor(
    @Inject('OAUTH2_CLIENT')
    private readonly oauth2Client: OAuth2Client,
  ) {}

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

  async summarizeByDraftId(emailData: SummarizeDraftDto): Promise<any> {
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    const draft = await gmail.users.drafts.get({
      userId: 'me',
      id: emailData.draftId,
      format: 'metadata',
    });
    const inReplyTo = draft.data.message.payload.headers.find(
      (h) => h.name === 'In-Reply-To',
    );
    const messages = await gmail.users.threads.get({
      userId: 'me',
      id: emailData.threadId,
      format: 'metadata',
    });

    const messageInReplyTo = messages.data.messages.find((m) => {
      const headers = m.payload.headers;
      return headers.some(
        (h) => h.name === 'Message-ID' && h.value === inReplyTo.value,
      );
    });

    const requestBody = {
      threadId: emailData.threadId,
      messageId: messageInReplyTo.id,
    };
    try {
      const response = await axios.post(
        this.modelUrl + 'summarize-email',
        requestBody,
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
