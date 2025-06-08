import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import { CreateSummarizeDto } from './dto/create-summarize.dto';
import { ReplyGenerateDto } from './dto/reply-generate.dto';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { SummarizeDraftDto } from './dto/summarize-draft.dto';
import Redis from 'ioredis';
import { BaseFilterDto } from '@/common/base/base-filter.dto';
import { MessageEntity } from './entities/message.entity';
import { Pagination } from '@/common/types/pagination';
import { Model } from 'mongoose';
import { EmailMessageDto } from './dto/email-message.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SummarizeEntity } from './entities/summarize.entity';
import { AuthService } from '@/auth/auth.service';
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  MODEL_URL,
} from '@environments';
import { ModelService } from '@/model/model.service';
import { ChatbotDto } from './dto/chatbot-message.dto';
import { LabelService } from '@/label/label.service';

@Injectable()
export class SummarizeService {
  constructor(
    @Inject('OAUTH2_CLIENT')
    private readonly oauth2Client: OAuth2Client,
    @Inject('REDIS_CLIENT')
    private readonly redisClient: Redis,
    @InjectModel('SUMMARIZE_MODEL')
    private readonly summarizeModel: Model<SummarizeEntity>,
    private readonly authService: AuthService,
    private readonly modelService: ModelService,
    private readonly labelService: LabelService,
  ) {}

  private extractContentFromEmail(payload: any): string {
    if (payload.body && payload.body.data) {
      return payload.body.data;
    }

    if (payload.parts && Array.isArray(payload.parts)) {
      for (const part of payload.parts) {
        const data = this.extractContentFromEmail(part);
        if (data) return data;
      }
    }

    return null;
  }

  async summarizeByMessageId(
    emailData: EmailMessageDto,
    user: any,
  ): Promise<any> {
    const cached_summary = await this.getSummarizeById(emailData.messageId);
    if (cached_summary) {
      return cached_summary;
    }

    try {
      const gmail = google.gmail({
        version: 'v1',
        auth: this.oauth2Client,
      });
      const message = await gmail.users.messages.get({
        userId: 'me',
        id: emailData.messageId,
      });
      const emailContent = this.extractContentFromEmail(message.data.payload);
      let attachmentIds = [];
      if (message.data.payload.parts) {
        attachmentIds = message.data.payload.parts.filter(
          (part) => part.filename && part.body.attachmentId,
        );
      }

      const attachments = await Promise.all(
        attachmentIds.map(async (id) => {
          const attachment = await gmail.users.messages.attachments.get({
            userId: 'me',
            id: id.body.attachmentId,
            messageId: emailData.messageId,
          });
          return {
            filename: id.filename,
            data: attachment.data.data,
          };
        }),
      );

      const model = await this.modelService.getSelectedByUserId(user.id);

      const language = emailData.language
        ? emailData.language
        : user.summaryLanguage;

      const response = await axios.post(
        MODEL_URL + 'summarize-email',
        {
          email_data: emailContent,
          attachments: attachments || [],
          model: model.model,
          provider: model.modelProvider,
          api_key: model.apiKey,
          api_key_type: model.apiKeyType,
          user_id: user.id,
          user_name: user.name,
          language: language,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      await this.saveSummarize({
        messageId: emailData.messageId,
        subject: message.data.payload.headers.find(
          (header) => header.name === 'Subject',
        ).value,
        summary: response.data.summary,
        userId: user.id,
        sentAt: new Date(Number(message.data.internalDate)),
        from: message.data.payload.headers.find(
          (header) => header.name === 'From',
        ).value,
        threadId: emailData.threadId,
        language: language,
      });

      return { ...response.data, language: language };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async summarizeByDraftId(
    emailData: SummarizeDraftDto,
    user: any,
  ): Promise<any> {
    await this.modelService.getSelectedByUserId(user.id);
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

    return await this.summarizeByMessageId(
      {
        threadId: emailData.threadId,
        messageId: messageInReplyTo.id,
      },
      user,
    );

    // const requestBody = {
    //   threadId: emailData.threadId,
    //   messageId: messageInReplyTo.id,
    // };
    // try {
    //   const response = await axios.post(
    //     this.modelUrl + 'summarize-email',
    //     requestBody,
    //     {
    //       headers: {
    //         'Content-Type': 'application/json',
    //       },
    //     },
    //   );

    //   return response.data;
    // } catch (error) {
    //   throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    // }
  }

  async summarizeByHistoryId(email: string, historyId: string) {
    const user = await this.authService.lookupAccessToken(email);
    this.oauth2Client.setCredentials({
      access_token: user.accessToken,
    });

    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    const history = await gmail.users.history.list({
      userId: 'me',
      startHistoryId: user.lastHistoryId,
      historyTypes: ['messageAdded'],
      labelId: 'INBOX',
    });

    const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    const messages = history.data.history?.flatMap((h) => h.messages) || [];
    const summaries = await Promise.all(
      messages.map(async (message) => {
        const summary = await this.summarizeByMessageId(
          { threadId: message.threadId, messageId: message.id },
          {
            ...userInfo,
            sessionId: user.sessionId,
            summaryLanguage: user.summaryLanguage,
          },
        );

        await this.labelService.classifyLabel(
          message.id,
          {
            ...userInfo,
            sessionId: user.sessionId,
            summaryLanguage: user.summaryLanguage,
          },
          summary.summary,
        );

        return summary;
      }),
    );
    if (messages.length > 0) {
      await this.authService.updateByUserId(user.userId, {
        lastHistoryId: historyId,
      });
    }

    return summaries;
  }

  async reSummarizeByMessageId(
    emailData: EmailMessageDto,
    user: any,
  ): Promise<any> {
    await this.summarizeModel.deleteOne({
      messageId: emailData.messageId,
      threadId: emailData.threadId,
      userId: user.id,
    });

    return await this.summarizeByMessageId(
      {
        threadId: emailData.threadId,
        messageId: emailData.messageId,
        language: emailData.language,
      },
      user,
    );
  }

  async replyScenario(messageId: string, user: any): Promise<any> {
    const model = await this.modelService.getSelectedByUserId(user.id);
    const summary = await this.getSummarizeById(messageId);
    try {
      const response = await axios.post(
        MODEL_URL + 'reply-scenarios',
        {
          summary: summary.summary,
          model: model.model,
          provider: model.modelProvider,
          api_key: model.apiKey,
          api_key_type: model.apiKeyType,
          user_id: user.id,
          user_name: user.name,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        output: response.data.reply_scenarios,
        messageId: messageId,
      };
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async replyGenerate(emailData: ReplyGenerateDto, user: any): Promise<any> {
    const model = await this.modelService.getSelectedByUserId(user.id);
    const summary = await this.getSummarizeById(emailData.messageId);
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    const message = await gmail.users.drafts.get({
      userId: 'me',
      id: emailData.draftId,
    });
    let attachmentIds = [];
    if (message.data.message.payload.parts) {
      attachmentIds = message.data.message.payload.parts.filter(
        (part) => part.filename && part.body.attachmentId,
      );
    }

    const attachments = await Promise.all(
      attachmentIds.map(async (id) => {
        const attachment = await gmail.users.messages.attachments.get({
          userId: 'me',
          id: id.body.attachmentId,
          messageId: message.data.id,
        });
        return {
          filename: id.filename,
          data: attachment.data.data,
        };
      }),
    );

    try {
      const requestBody = summary
        ? {
            draft_id: emailData.draftId,
            summary: summary.summary,
            message: emailData.description,
            model: model.model,
            provider: model.modelProvider,
            api_key: model.apiKey,
            api_key_type: model.apiKeyType,
            user_id: user.id,
            user_name: user.name,
            attachments: attachments,
          }
        : {
            draft_id: emailData.draftId,
            message: emailData.description,
            model: model.model,
            provider: model.modelProvider,
            api_key: model.apiKey,
            api_key_type: model.apiKeyType,
            user_id: user.id,
            user_name: user.name,
            attachments: attachments,
          };

      const response = await axios.post(
        MODEL_URL + 'reply-generate',
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

  async chatbot(user: any, message: ChatbotDto): Promise<any> {
    const model = await this.modelService.getSelectedByUserId(user.id);
    try {
      const userInfo = await this.authService.findBySessionId(user.sessionId);

      const requestBody = {
        refresh_token: userInfo.refreshToken,
        expiry_date: userInfo.expiresAt.getTime().toString(),
        access_token: userInfo.accessToken,
        token_type: userInfo.tokenType,
        id_token: userInfo.idToken,
        scope: userInfo.scope,
        user_id: userInfo.userId,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        message: message.message,
        model: model.model,
        provider: model.modelProvider,
        api_key: model.apiKey,
        api_key_type: model.apiKeyType,
        user_name: user.name,
        thread_id: message.threadId,
        email_id: message.emailId,
      };

      const response = await axios.post(MODEL_URL + 'chatbot', requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async search(user: any, message: string): Promise<any> {
    const model = await this.modelService.getSelectedByUserId(user.id);
    try {
      const userInfo = await this.authService.findBySessionId(user.sessionId);

      const requestBody = {
        refresh_token: userInfo.refreshToken,
        expiry_date: userInfo.expiresAt.getTime().toString(),
        access_token: userInfo.accessToken,
        token_type: userInfo.tokenType,
        id_token: userInfo.idToken,
        scope: userInfo.scope,
        user_id: userInfo.userId,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        message: message,
        model: model.model,
        provider: model.modelProvider,
        api_key: model.apiKey,
        api_key_type: model.apiKeyType,
        user_name: user.name,
      };
      const response = await axios.post(MODEL_URL + 'search', requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getChatHistory(
    key: string,
    isChatbot: boolean,
    user: any,
    filterDto?: BaseFilterDto<MessageEntity>,
  ): Promise<MessageEntity[] | Pagination<MessageEntity>> {
    try {
      if (isChatbot) {
        key = `${user.id}_${key}`;
      }

      const total = await this.redisClient.llen(key);

      const start = (filterDto.page - 1) * filterDto.limit;
      const end = start + filterDto.limit - 1;

      const safeStart = Math.max(start, 0);
      const safeEnd = Math.max(end, 0);

      const chatHistory = await this.redisClient.lrange(
        key,
        safeStart,
        safeEnd,
      );
      if (!chatHistory) {
        throw new HttpException('Chat history not found', HttpStatus.NOT_FOUND);
      }

      const parsedChatHistory = chatHistory.reverse().map((item) => {
        const msg = JSON.parse(item);
        // let content: string = msg.data.content;
        // if (msg.type === 'human') {
        //   content = content
        //     .match(/\{user_messsage\}:\s*([\s\S]*?)(?:\n\{|\Z)/)[1]
        //     .trim();
        // }

        return {
          type: msg.type,
          message: msg.content,
        };
      });

      const hasNextPage = filterDto.page * filterDto.limit < total;
      const nextPage = hasNextPage ? filterDto.page + 1 : null;

      return { data: parsedChatHistory, total, page: filterDto.page, nextPage };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteChatHistory(
    key: string,
    isChatbot: boolean,
    user: any,
  ): Promise<any> {
    try {
      if (isChatbot) {
        key = `${user.id}_${key}`;
      }
      const result = await this.redisClient.del(key);
      if (result === 1) {
        return { message: 'Chat history deleted successfully' };
      } else {
        throw new HttpException('Chat history not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getThreadHistory(user: any): Promise<any> {
    const stream = this.redisClient.scanStream({
      match: `${user.id}_*`,
    });

    const threadHistory = [];

    for await (const resultKeys of stream) {
      for (const key of resultKeys) {
        const type = await this.redisClient.type(key);

        if (type === 'list') {
          const firstElement = await this.redisClient.lindex(key, -1);
          threadHistory.push({ key, value: firstElement });
        }
      }
    }

    return threadHistory.map((item) => {
      return {
        key: item.key.split('_')[1],
        value: JSON.parse(item.value).content,
      };
    });
  }

  async saveSummarize(
    summaryData: CreateSummarizeDto,
  ): Promise<SummarizeEntity> {
    const createdSummary = new this.summarizeModel(summaryData);
    return await createdSummary.save();
  }

  async getSummarizeById(id: string): Promise<SummarizeEntity> {
    const summary = await this.summarizeModel.findOne({ messageId: id });
    return summary;
  }

  async getSummarizeByUserId(
    user: any,
    filter: BaseFilterDto<SummarizeEntity>,
  ): Promise<SummarizeEntity[] | Pagination<SummarizeEntity>> {
    const [summaries, total] = await Promise.all([
      this.summarizeModel
        .find({ userId: user.id })
        .skip(filter.skip)
        .limit(filter.limit)
        .sort({ sentAt: -1 }), // sắp xếp mới nhất trước (nếu muốn)
      this.summarizeModel.countDocuments({ userId: user.id }),
    ]);

    const totalPages = Math.ceil(total / filter.limit);
    const nextPage = filter.page < totalPages ? filter.page + 1 : null;

    return { data: summaries, total, page: filter.page, nextPage };
  }

  async updateLanguage(user: any, language: string): Promise<any> {
    return await this.authService.updateByUserId(user.id, {
      summaryLanguage: language,
    });
  }
}
