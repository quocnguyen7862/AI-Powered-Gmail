import { Module } from '@nestjs/common';
import { SummarizeService } from './summarize.service';
import { SummarizeController } from './summarize.controller';
import { SummarizeSchema } from './entities/summarize.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelModule } from '@/model/model.module';
import { LabelModule } from '@/label/label.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'SUMMARIZE_MODEL', schema: SummarizeSchema },
    ]),
    ModelModule,
    LabelModule,
  ],
  controllers: [SummarizeController],
  providers: [SummarizeService],
})
export class SummarizeModule {}
