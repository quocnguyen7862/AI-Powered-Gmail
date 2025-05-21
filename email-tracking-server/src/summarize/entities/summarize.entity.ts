import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'email_summaries' })
export class SummarizeEntity {
  @Prop({ type: Object })
  from: object;
  @Prop()
  messageId: string;
  @Prop()
  subject: string;
  @Prop()
  summary: string;
}

export const SummarizeSchema = SchemaFactory.createForClass(SummarizeEntity);
