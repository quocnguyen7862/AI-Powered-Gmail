export class CreateSummarizeDto {
  from?: string;
  messageId: string;
  subject: string;
  summary: string;
  userId: string;
  sentAt: Date;
  threadId: string;
  language: string;
}
