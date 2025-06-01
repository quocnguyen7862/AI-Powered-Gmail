import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'email_summaries' })
export class SummarizeEntity {
  @Prop()
  userId: string;
  @Prop()
  sentAt: Date;
  @Prop()
  from: string;
  @Prop()
  messageId: string;
  @Prop()
  threadId: string;
  @Prop()
  subject: string;
  @Prop()
  summary: string;
}

export const SummarizeSchema = SchemaFactory.createForClass(SummarizeEntity);
